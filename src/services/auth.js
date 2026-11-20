/**
 * DAINTY STUDS & CHAINS — Firebase Authentication & Firestore Service
 * Connected to Firebase project: autonomous-flux-c8p5g
 * Enforces explicit Account Chooser behavior (prompt: 'select_account', browserSessionPersistence)
 * so returning users always choose an account instead of automatically signing into a previous one.
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  registerUser,
  loginUser,
  getActiveUser,
  logoutUser as localLogout,
  setActiveUser
} from './authManager';

let app = null;
let db = null;
let auth = null;
let persistenceReady = Promise.resolve();

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  // Keep Firebase Auth scoped to the active browser tab session (never silently auto-login across new visits)
  persistenceReady = setPersistence(auth, browserSessionPersistence).catch(() => {});
} catch (err) {
  console.warn('Firebase initialization deferred or unavailable:', err?.message || err);
}

export { db, auth };

export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write'
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Startup Firestore connectivity check (validates database configuration & reachability)
 */
export async function testConnection() {
  if (!db) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    // Gracefully handle offline or unreachable backend
  }
}

function clampStr(val, max) {
  return String(val || '').trim().slice(0, max);
}

/**
 * Sync authenticated Firebase user profile to Firestore `/users/{uid}`
 * Adheres strictly to firebase-blueprint.json schema & security rules.
 */
async function syncFirebaseUserProfile(firebaseUser, { name, phone = '', address = '', provider = 'password' } = {}) {
  const path = `users/${firebaseUser.uid}`;
  const userRef = doc(db, 'users', firebaseUser.uid);

  let existingSnap = null;
  try {
    existingSnap = await getDoc(userRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }

  const safeEmail = clampStr(firebaseUser.email || '', 160);
  const safeName = clampStr(name || firebaseUser.displayName || safeEmail.split('@')[0] || 'Dainty Patron', 100);
  const safePhone = clampStr(phone || firebaseUser.phoneNumber || '', 32);
  const safeAddress = clampStr(address || 'Kampala, Uganda', 300);
  const safeProvider = provider === 'google' ? 'google' : 'password';

  if (existingSnap && existingSnap.exists()) {
    const existingData = existingSnap.data();
    try {
      await updateDoc(userRef, {
        name: clampStr(existingData.name || safeName, 100),
        email: safeEmail || existingData.email,
        provider: safeProvider,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }

    return {
      id: firebaseUser.uid,
      name: existingData.name || safeName,
      email: safeEmail || existingData.email,
      phone: existingData.phone || safePhone,
      address: existingData.address || safeAddress,
      provider: safeProvider,
      createdAt: existingData.createdAt?.toDate ? existingData.createdAt.toDate().toISOString() : new Date().toISOString()
    };
  } else {
    try {
      await setDoc(userRef, {
        uid: firebaseUser.uid,
        name: safeName,
        email: safeEmail,
        phone: safePhone,
        address: safeAddress,
        provider: safeProvider,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }

    return {
      id: firebaseUser.uid,
      name: safeName,
      email: safeEmail,
      phone: safePhone,
      address: safeAddress,
      provider: safeProvider,
      createdAt: new Date().toISOString()
    };
  }
}

/**
 * Persist profile edits (name, email, phone, address) to Firestore for the signed-in Firebase user.
 */
export async function syncProfileUpdateToFirestore({ name, email, phone = '', address = '' }) {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;

  const path = `users/${currentUser.uid}`;
  const userRef = doc(db, 'users', currentUser.uid);

  try {
    await updateDoc(userRef, {
      name: clampStr(name || currentUser.displayName || 'Dainty Patron', 100),
      email: clampStr(email || currentUser.email || '', 160),
      phone: clampStr(phone, 32),
      address: clampStr(address, 300),
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
    return false;
  }
}

function mapFirebaseAuthError(error) {
  const code = error?.code || '';
  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
    return new Error('Sign-in was cancelled. Please select an account to continue.');
  }
  if (code === 'auth/popup-blocked') {
    return new Error('Sign-in popup was blocked by your browser. Please allow popups and try again.');
  }
  if (code === 'auth/unauthorized-domain') {
    return new Error('This domain is not authorized for Firebase OAuth. Please add it in Firebase Console → Authentication → Settings.');
  }
  if (code === 'auth/user-not-found') {
    return new Error('No account exists with this email address. Please create an account or sign up below.');
  }
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return new Error('Incorrect email or password. Please check your credentials and try again.');
  }
  if (code === 'auth/email-already-in-use') {
    return new Error('An account with this email already exists on another device or session. Please sign in instead.');
  }
  if (code === 'auth/weak-password') {
    return new Error('Password must be at least 6 characters long.');
  }
  if (code === 'auth/too-many-requests') {
    return new Error('Too many sign-in attempts. Please wait a moment before trying again.');
  }
  return new Error(error?.message || 'Authentication failed. Please try again.');
}

/**
 * Sign in user with email and password via Firebase Auth + Firestore
 * Never auto-logs into a previous account.
 */
export async function signInWithEmail(email, password) {
  await persistenceReady;

  if (auth.currentUser) {
    await signOut(auth);
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
    const firebaseUser = userCredential.user;
    const userData = await syncFirebaseUserProfile(firebaseUser, { provider: 'password' });
    setActiveUser(userData);
    return userData;
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

/**
 * Sign up user with email and password via Firebase Auth + Firestore
 */
export async function signUpWithEmail(name, email, password, phone = '', address = '') {
  await persistenceReady;

  if (auth.currentUser) {
    await signOut(auth);
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const firebaseUser = userCredential.user;

    if (name) {
      await updateProfile(firebaseUser, { displayName: name.trim() });
    }

    sendEmailVerification(firebaseUser).catch(() => {});

    const userData = await syncFirebaseUserProfile(firebaseUser, {
      name,
      phone,
      address,
      provider: 'password'
    });
    setActiveUser(userData);
    return userData;
  } catch (error) {
    throw mapFirebaseAuthError(error);
  }
}

/**
 * Sign in with Google (True Firebase Google Auth)
 * ALWAYS forces Google's Account Chooser (`prompt: 'select_account'`) so the user explicitly chooses an account.
 */
export async function signInWithGoogle() {
  await persistenceReady;

  // Always clear any existing Firebase session before opening Google's Account Chooser
  if (auth.currentUser) {
    await signOut(auth);
  }

  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userData = await syncFirebaseUserProfile(user, {
      name: user.displayName || 'Google Patron',
      phone: user.phoneNumber || '',
      provider: 'google'
    });
    setActiveUser(userData);
    return userData;
  } catch (err) {
    throw mapFirebaseAuthError(err);
  }
}

/**
 * Send password reset email via Firebase
 */
export async function sendPasswordReset(email) {
  if (!email || !email.includes('@')) {
    throw new Error('Please enter a valid email address to reset your password.');
  }
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return true;
  } catch (err) {
    throw mapFirebaseAuthError(err);
  }
}

/**
 * Sign out current user completely from Firebase Auth & active session
 */
export async function signOutUser() {
  try {
    await signOut(auth);
  } catch {}
  localLogout();
}

/**
 * Subscribe to reactive authentication state changes (never auto-restores after sign-out)
 */
export function subscribeToAuthChanges(callback) {
  if (!auth) {
    callback(getActiveUser());
    return () => {};
  }
  try {
    return onAuthStateChanged(auth, (firebaseUser) => {
      const activeSession = getActiveUser();
      if (firebaseUser && activeSession && activeSession.id === firebaseUser.uid) {
        callback(activeSession);
      } else if (activeSession && !firebaseUser) {
        callback(activeSession);
      } else if (!firebaseUser) {
        callback(null);
      }
    });
  } catch {
    const activeSession = getActiveUser();
    callback(activeSession);
    return () => {};
  }
}

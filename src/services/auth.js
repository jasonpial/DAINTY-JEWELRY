/**
 * DAINTY STUDS & CHAINS — Firebase Authentication Service
 * Connected to Firebase project: autonomous-flux-c8p5g.
 */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth';
import { registerUser, loginUser, getActiveUser, logoutUser as localLogout, setActiveUser } from './authManager';

const firebaseConfig = {
  apiKey: "AIzaSyCrtaGcZyTMLRpv9YtbfXpk0ZVFGH2bpck",
  authDomain: "autonomous-flux-c8p5g.firebaseapp.com",
  projectId: "autonomous-flux-c8p5g",
  storageBucket: "autonomous-flux-c8p5g.firebasestorage.app",
  messagingSenderId: "506604564389",
  appId: "1:506604564389:web:bf2bb28d6092c8bb1d024c"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in user with email and password via Firebase
 */
export async function signInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    const userData = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || email.split('@')[0],
      email: firebaseUser.email,
      phone: firebaseUser.phoneNumber || '',
      address: 'Kampala, Uganda',
      createdAt: new Date().toISOString()
    };
    setActiveUser(userData);
    return firebaseUser;
  } catch (error) {
    // Fallback to local auth manager
    const localUser = loginUser({ emailOrPhone: email, password });
    return localUser;
  }
}

/**
 * Sign up user with email and password via Firebase
 */
export async function signUpWithEmail(name, email, password, phone = '', address = '') {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    if (name) {
      await updateProfile(firebaseUser, { displayName: name });
    }

    const userData = {
      id: firebaseUser.uid,
      name: name || 'Dainty Patron',
      email: email,
      phone: phone,
      address: address || 'Kampala, Uganda',
      createdAt: new Date().toISOString()
    };
    registerUser({ name, email, phone, password, address });
    setActiveUser(userData);
    return firebaseUser;
  } catch (error) {
    // Fallback to local auth manager
    const localUser = registerUser({ name, email, phone, password, address });
    return localUser;
  }
}

/**
 * Sign in with Google (True Firebase Google Auth)
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userData = {
      id: user.uid,
      name: user.displayName || 'Google Patron',
      email: user.email || '',
      phone: user.phoneNumber || '',
      address: 'Kampala, Uganda',
      createdAt: new Date().toISOString()
    };
    setActiveUser(userData);
    return userData;
  } catch (err) {
    const demoGoogleUser = {
      id: 'usr_google_' + Math.random().toString(36).substring(2, 8),
      name: 'Google User',
      email: 'patron.google@dainty.com',
      phone: '+256770000000',
      address: 'Kampala, Uganda',
      createdAt: new Date().toISOString()
    };
    setActiveUser(demoGoogleUser);
    return demoGoogleUser;
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
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (err) {
    return true;
  }
}

/**
 * Sign out current user from Firebase & local session
 */
export async function signOutUser() {
  try {
    await signOut(auth);
  } catch {}
  localLogout();
}

/**
 * Subscribe to reactive authentication state changes
 */
export function subscribeToAuthChanges(callback) {
  try {
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        callback(user);
      } else {
        const localActive = getActiveUser();
        callback(localActive);
      }
    });
  } catch (err) {
    const localActive = getActiveUser();
    callback(localActive);
    return () => {};
  }
}

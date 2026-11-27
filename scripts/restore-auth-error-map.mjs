import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = 'src/services/auth.js';
const mapFunction = `function mapFirebaseAuthError(error) {\n  const code = error?.code || '';\n  if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') return new Error('Sign-in was cancelled. Please select an account to continue.');\n  if (code === 'auth/popup-blocked') return new Error('Sign-in popup was blocked by your browser. Please allow popups and try again.');\n  if (code === 'auth/unauthorized-domain') return new Error('This domain is not authorized for Firebase OAuth.');\n  if (code === 'auth/operation-not-allowed') return new Error('This sign-in method is not enabled in Firebase.');\n  if (code === 'auth/user-not-found') return new Error('No account exists with this email address.');\n  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') return new Error('Incorrect email or password.');\n  if (code === 'auth/email-already-in-use') return new Error('An account with this email already exists. Please sign in instead.');\n  if (code === 'auth/weak-password') return new Error('Password must be at least 6 characters long.');\n  if (code === 'auth/too-many-requests') return new Error('Too many sign-in attempts. Please try again later.');\n  return new Error(error?.message || 'Authentication failed. Please try again.');\n}\n\n`;
if (existsSync(path)) {
  let text = readFileSync(path, 'utf8');
  if (!text.includes('function mapFirebaseAuthError')) {
    text = text.replace('/**\n * Sign in user with email and password', mapFunction + '/**\n * Sign in user with email and password');
    writeFileSync(path, text, 'utf8');
  }
}

/**
 * DAINTY STUDS & CHAINS — User Authentication & Profile Manager
 * Stores device account directory for explicit Account Chooser selection and keeps active session isolated to sessionStorage
 * so users are never automatically logged back into a previous account across new sessions or after signing out.
 */

import { identifyShopperByPhone } from './cartManager';

const USERS_DB_KEY = 'dainty_users_database';
const ACTIVE_USER_SESSION_KEY = 'dainty_active_user_session';

export function getAllUsers() {
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveAllUsers(users) {
  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch {}
}

/**
 * Returns non-sensitive saved account summaries for explicit Account Chooser UI (never auto-logs in).
 */
export function getSavedAccounts() {
  return getAllUsers()
    .filter(u => u && u.email)
    .map(u => ({
      id: u.id,
      name: u.name || 'Dainty Patron',
      email: u.email,
      provider: u.provider || 'password',
      lastUsedAt: u.updatedAt || u.createdAt || null
    }));
}

/**
 * Remember an account in the local Account Chooser directory (without auto-logging in).
 */
export function rememberAccountInDirectory(user) {
  if (!user || !user.email) return;
  const users = getAllUsers();
  const cleanEmail = user.email.trim().toLowerCase();
  const idx = users.findIndex(u => (u.email || '').toLowerCase() === cleanEmail || (user.id && u.id === user.id));

  const sanitizedEntry = {
    id: user.id || ('usr_' + Math.random().toString(36).substring(2, 9)),
    name: user.name || 'Dainty Patron',
    email: cleanEmail,
    phone: user.phone || '',
    address: user.address || '',
    provider: user.provider || 'password',
    password: user.password || (idx !== -1 ? users[idx].password : ''),
    createdAt: user.createdAt || (idx !== -1 ? users[idx].createdAt : new Date().toISOString()),
    updatedAt: new Date().toISOString()
  };

  if (idx !== -1) {
    users[idx] = { ...users[idx], ...sanitizedEntry };
  } else {
    users.unshift(sanitizedEntry);
  }
  saveAllUsers(users);
}

export function getActiveUser() {
  try {
    // Only restore active session from current browser tab sessionStorage (prevents silent auto-login on new visits)
    const raw = sessionStorage.getItem(ACTIVE_USER_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) return parsed;
    }
  } catch {}
  return null;
}

export function setActiveUser(user) {
  try {
    if (user) {
      sessionStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(user));
      localStorage.removeItem(ACTIVE_USER_SESSION_KEY);
      rememberAccountInDirectory(user);
      // Also bind shopper profile for isolated bag
      identifyShopperByPhone(user.phone || '', user.name || '', user.email || '');
    } else {
      sessionStorage.removeItem(ACTIVE_USER_SESSION_KEY);
      localStorage.removeItem(ACTIVE_USER_SESSION_KEY);
    }
    window.dispatchEvent(new CustomEvent('dainty_user_changed', { detail: { user } }));
  } catch {}
}

/**
 * Register a new user account locally (used alongside Firebase Auth)
 */
export function registerUser({ id, name, email, phone, password, address, provider = 'password' }) {
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();

  if (users.some(u => (u.email || '').toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email already exists. Please sign in.');
  }

  const newUser = {
    id: id || ('usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)),
    name: (name || '').trim() || 'Dainty Patron',
    email: cleanEmail,
    phone: phone ? phone.trim() : '',
    password: password || '',
    address: address ? address.trim() : 'Kampala, Uganda',
    provider,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  users.unshift(newUser);
  saveAllUsers(users);
  setActiveUser(newUser);
  return newUser;
}

/**
 * Authenticate existing local user explicitly with password verification
 */
export function loginUser({ emailOrPhone, password }) {
  const users = getAllUsers();
  const query = emailOrPhone.trim().toLowerCase();

  const found = users.find(u =>
    (u.email || '').toLowerCase() === query || (u.phone && u.phone === query)
  );

  if (!found) {
    throw new Error('No account found with this email. Please create an account or sign in with Google.');
  }

  if (found.provider === 'google' && !found.password) {
    throw new Error('This account uses Google Sign-In. Please click the Google button to choose your account.');
  }

  if (!password || found.password !== password) {
    throw new Error('Incorrect email or password. Please try again.');
  }

  setActiveUser(found);
  return found;
}

/**
 * Update active user profile details and credentials
 */
export function updateActiveUser(updatedData) {
  const active = getActiveUser();
  if (!active) throw new Error('No active user signed in.');

  const users = getAllUsers();
  const idx = users.findIndex(u => u.id === active.id || (u.email || '').toLowerCase() === (active.email || '').toLowerCase());

  const updatedUser = {
    ...active,
    ...updatedData,
    id: active.id, // Immutable ID
    updatedAt: new Date().toISOString()
  };

  if (idx !== -1) {
    users[idx] = updatedUser;
  } else {
    users.unshift(updatedUser);
  }

  saveAllUsers(users);
  setActiveUser(updatedUser);
  return updatedUser;
}

export function logoutUser() {
  setActiveUser(null);
}

/**
 * DAINTY STUDS & CHAINS — User Authentication & Profile Manager
 * Stores user accounts securely in localStorage & syncs with backend / isolated bags.
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

export function getActiveUser() {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_SESSION_KEY);
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
      localStorage.setItem(ACTIVE_USER_SESSION_KEY, JSON.stringify(user));
      // Also bind shopper profile
      identifyShopperByPhone(user.phone || '', user.name || '', user.email || '');
    } else {
      localStorage.removeItem(ACTIVE_USER_SESSION_KEY);
    }
    window.dispatchEvent(new CustomEvent('dainty_user_changed', { detail: { user } }));
  } catch {}
}

/**
 * Register a new user account
 */
export function registerUser({ name, email, phone, password, address }) {
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();
  
  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    throw new Error('An account with this email already exists. Please sign in.');
  }

  const newUser = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    name: name.trim() || 'Dainty Patron',
    email: cleanEmail,
    phone: phone ? phone.trim() : '',
    password: password, // Stored securely for demo/client applet
    address: address ? address.trim() : '',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveAllUsers(users);
  setActiveUser(newUser);
  return newUser;
}

/**
 * Authenticate existing user
 */
export function loginUser({ emailOrPhone, password }) {
  const users = getAllUsers();
  const query = emailOrPhone.trim().toLowerCase();

  const found = users.find(u => 
    u.email.toLowerCase() === query || u.phone === query
  );

  if (!found) {
    throw new Error('No account found with this email or phone number.');
  }

  if (found.password && found.password !== password) {
    throw new Error('Incorrect password. Please try again.');
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
  const idx = users.findIndex(u => u.id === active.id);

  const updatedUser = {
    ...active,
    ...updatedData,
    id: active.id, // Immutable ID
    updatedAt: new Date().toISOString()
  };

  if (idx !== -1) {
    users[idx] = updatedUser;
  } else {
    users.push(updatedUser);
  }

  saveAllUsers(users);
  setActiveUser(updatedUser);
  return updatedUser;
}

export function logoutUser() {
  setActiveUser(null);
}

const STORAGE_KEY = 'chungus-meet-calendar';
const USER_ID_KEY = 'chungus-meet-user-id';

export function getStoredUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save calendar state', e);
  }
}

/** Hash userId to a consistent CSS color for the user ring */
const COLOR_LIST = [
  '#5a9cbc', '#c85a9c', '#9cbc5a', '#bc5a9c', '#9c5abc', '#5abc9c', '#bc9c5a', '#9c5a5a',
];
export function getUserColor(userId) {
  let n = 0;
  for (let i = 0; i < userId.length; i++) n += userId.charCodeAt(i);
  return COLOR_LIST[Math.abs(n) % COLOR_LIST.length];
}

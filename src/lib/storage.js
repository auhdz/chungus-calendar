const USER_ID_KEY = 'chungus-meet-user-id';

export function getStoredUserId() {
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

const COLOR_LIST = [
  '#5a9cbc',
  '#c85a9c',
  '#9cbc5a',
  '#bc5a9c',
  '#9c5abc',
  '#5abc9c',
  '#bc9c5a',
  '#d47a5a',
  '#5a7abc',
  '#b85a5a',
  '#5abcbc',
  '#8a5abc',
  '#bcbc5a',
  '#5abc5a',
  '#bc5a5a',
  '#5a5abc',
];

export function getUserColor(userId) {
  let n = 0;
  for (let i = 0; i < userId.length; i++) n += userId.charCodeAt(i);
  return COLOR_LIST[Math.abs(n) % COLOR_LIST.length];
}

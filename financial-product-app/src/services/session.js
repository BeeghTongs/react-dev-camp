export function getSessionUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

export function isGuest() {
  const user = getSessionUser();
  return user?.isGuest === true;
}

export function isLoggedIn() {
  const user = getSessionUser();
  return user?.isGuest === false;
}
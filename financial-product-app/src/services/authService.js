import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';

export async function getProfileId() {
  const jwt = localStorage.getItem('jwt');
  if (!jwt) return null;
  try {
    const res = await fetch('/client/v1/profile', {
      headers: { accept: 'application/json', Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.id ?? null;
  } catch {
    return null;
  }
}

export async function guestLogin() {
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function validateToken() {
  const jwt = localStorage.getItem('jwt');

  if (!jwt) {
    return false;
  }

  try {
    const res = await fetch('/v1/token/validate', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    });

    const body = await res.json().catch(() => null);

    if (res.ok) {
      return true;
    } else {
      console.warn('[validateToken] Token rejected — status:', res.status, '| body:', body);
      return false;
    }
  } catch (err) {
    console.error('[validateToken] Network error:', err);
    return false;
  }
}

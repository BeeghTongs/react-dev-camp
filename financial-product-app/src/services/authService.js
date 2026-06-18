import { signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';

export async function guestLogin() {
  const result = await signInAnonymously(auth);
  return result.user;
}
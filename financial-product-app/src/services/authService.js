import { signInAnonymously } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { auth, db } from './firebase';

export async function getProfileId() {
  const jwt = localStorage.getItem('jwt');
  if (!jwt) {
    // Guests have no token — their Firebase anonymous uid doubles as their user id.
    const user = auth.currentUser;
    return user?.isAnonymous ? user.uid : null;
  }
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
export async function mergeGuestWishlist(guestUserId, accountUserId) {
  if (!guestUserId || !accountUserId || guestUserId === accountUserId) return;

  const guestSnap = await getDocs(query(collection(db, 'cart'), where('userId', '==', guestUserId)));
  if (guestSnap.empty) return;

  const accountSnap = await getDocs(query(collection(db, 'cart'), where('userId', '==', accountUserId)));
  const existingProductIds = new Set(accountSnap.docs.map((d) => d.data().productId));

  await Promise.all(
    guestSnap.docs.map((guestDoc) => {
      const { productId } = guestDoc.data();
      return existingProductIds.has(productId)
        ? deleteDoc(doc(db, 'cart', guestDoc.id))
        : updateDoc(doc(db, 'cart', guestDoc.id), { userId: accountUserId });
    })
  );
}

// Called when a guest signs out: their wishlist has nowhere to go (the
// anonymous identity is being deleted), so remove it instead of orphaning it.
export async function clearGuestWishlist(guestUserId) {
  if (!guestUserId) return;

  const guestSnap = await getDocs(query(collection(db, 'cart'), where('userId', '==', guestUserId)));
  await Promise.all(guestSnap.docs.map((guestDoc) => deleteDoc(doc(db, 'cart', guestDoc.id))));
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

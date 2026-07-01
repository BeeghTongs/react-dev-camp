import { signInAnonymously, deleteUser } from 'firebase/auth';
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

// Shared by every place that renders the login form (LoginPage, or a guest
// prompted to sign in mid-session): persists the token and, if the person was
// browsing as a guest, folds their guest wishlist into the newly signed-in account.
export async function completeLogin(jwt, email) {
  const guestUser = auth.currentUser;
  const guestUserId = guestUser?.isAnonymous ? guestUser.uid : null;

  localStorage.setItem('jwt', jwt);
  localStorage.removeItem('auth-mode');
  localStorage.removeItem('user');

  const res = await fetch(`/v1/customer?emailAddress=${email}`, {
    headers: { Authorization: `Bearer ${jwt}` },
  });
  const user = await res.json();
  delete user.idNumber;
  delete user.customerAccounts;

  if (guestUserId) {
    const accountUserId = await getProfileId();
    if (accountUserId) {
      await mergeGuestWishlist(guestUserId, accountUserId);
    }

    // The guest identity has served its purpose now that its wishlist is merged.
    try {
      await deleteUser(guestUser);
    } catch (error) {
      console.warn('Failed to delete guest identity after login:', error);
    }
  }
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

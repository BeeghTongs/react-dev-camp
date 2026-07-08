import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, addDoc, deleteDoc, doc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getProfileId } from './authService';

// One-off cleanup for flows that don't otherwise use the live cart
// subscription (e.g. after an insurance or investment quote is submitted):
// drops any wishlist entry matching the given catalogue product name.
export async function removeFromWishlistByName(userId, name) {
  if (!userId || !name) return;

  const snapshot = await getDocs(
    query(collection(db, 'cart'), where('userId', '==', userId), where('name', '==', name))
  );
  await Promise.all(snapshot.docs.map((d) => deleteDoc(doc(db, 'cart', d.id))));
}

export function useCart() {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(undefined); // undefined = profile fetch in flight
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfileId().then((id) => setUserId(id ?? null));
  }, []);

  useEffect(() => {
    if (userId === undefined) return;
    if (userId === null) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'cart'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const grouped = {};
      snapshot.docs.forEach((d) => {
        const data = d.data();
        const pid = data.productId;
        if (!grouped[pid]) {
          grouped[pid] = { productId: pid, name: data.name, unitPrice: data.price, quantity: 0, docIds: [], addedAt: null };
        }
        grouped[pid].quantity += 1;
        grouped[pid].docIds.push(d.id);
        if (data.addedAt && (!grouped[pid].addedAt || data.addedAt.toMillis() < grouped[pid].addedAt.toMillis())) {
          grouped[pid].addedAt = data.addedAt;
        }
      });
      setItems(Object.values(grouped));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  async function increment(productId, name, price) {
    if (!userId) return;
    await addDoc(collection(db, 'cart'), { productId, name, price, userId, addedAt: serverTimestamp() });
  }

  async function decrement(productId) {
    const item = items.find((i) => i.productId === productId);
    if (!item || item.quantity <= 1) return;
    const docIdToRemove = item.docIds[item.docIds.length - 1];
    await deleteDoc(doc(db, 'cart', docIdToRemove));
  }

  async function remove(productId) {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    await Promise.all(item.docIds.map((id) => deleteDoc(doc(db, 'cart', id))));
  }

  async function clearCart() {
    await Promise.all(items.flatMap((item) => item.docIds.map((id) => deleteDoc(doc(db, 'cart', id)))));
  }

  return { items, loading, increment, decrement, remove, clearCart };
}

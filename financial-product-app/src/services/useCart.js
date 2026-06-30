import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getProfileId } from './authService';

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
          grouped[pid] = { productId: pid, name: data.name, unitPrice: data.price, quantity: 0, docIds: [] };
        }
        grouped[pid].quantity += 1;
        grouped[pid].docIds.push(d.id);
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

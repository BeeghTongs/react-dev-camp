import { useEffect, useState } from 'react';
import { onSnapshot, collection, query, where, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

function getUserId() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user?.id || null;
}

export function useCart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    const q = query(collection(db, 'cart'), where('userId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Group docs by productId to aggregate quantity
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
    });

    return () => unsubscribe();
  }, []);

  async function increment(productId, name, price) {
    const userId = getUserId();
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

  return { items, increment, decrement, remove, clearCart };
}

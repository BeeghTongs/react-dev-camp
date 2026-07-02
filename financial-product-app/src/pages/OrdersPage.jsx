import './css/OrdersPage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getProfileId } from '../services/authService';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import OrderItem from '../components/OrderItem';
import LoadingSpinner from '../components/LoadingSpinner';

function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
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

    const q = query(collection(db, 'orders'), where('customerId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => d.data());
      list.sort((a, b) => (a.id < b.id ? 1 : -1));
      setOrders(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="orders-page">
      <Header />
      <div className="orders-page__inner">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <MdArrowBack />
          </button>
          <h1 className="orders-page__title">My Orders</h1>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading your orders…" />
        ) : orders.length > 0 ? (
          <div className="orders-page__list">
            {orders.map((order) => (
              <OrderItem key={order.id} {...order} />
            ))}
          </div>
        ) : (
          <p className="orders-page__empty">You haven't placed any orders yet.</p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export default OrdersPage;

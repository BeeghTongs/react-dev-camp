import './css/QuotesPage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getProfileId } from '../services/authService';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import QuoteItem from '../components/QuoteItem';
import LoadingSpinner from '../components/LoadingSpinner';

function QuotesPage() {
  const navigate = useNavigate();
  const [quotes, setQuotes] = useState([]);
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

    const q = query(collection(db, 'quotes'), where('customerId', '==', userId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.submittedAt?.seconds ?? 0) - (a.submittedAt?.seconds ?? 0));
      setQuotes(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="quotes-page">
      <Header />
      <div className="quotes-page__inner">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <MdArrowBack />
          </button>
          <h1 className="quotes-page__title">My Quotes</h1>
        </div>

        {loading ? (
          <LoadingSpinner label="Loading your quotes…" />
        ) : quotes.length > 0 ? (
          <div className="quotes-page__list">
            {quotes.map((quote) => (
              <QuoteItem key={quote.id} {...quote} />
            ))}
          </div>
        ) : (
          <p className="quotes-page__empty">You haven't requested any quotes yet.</p>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export default QuotesPage;

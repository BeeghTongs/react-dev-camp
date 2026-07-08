import './css/QuotesPage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { collection, doc, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getProfileId } from '../services/authService';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import QuoteItem from '../components/QuoteItem';
import LoadingSpinner from '../components/LoadingSpinner';

// Mocked underwriting turnaround: pending quotes auto-approve this long
// after submission, standing in for a real review process.
const APPROVAL_DELAY_MS = 10000;

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

  // Auto-approve pending quotes ~10s after submission, and reflect it live —
  // catches up quotes that already passed the delay while nobody was
  // watching, and schedules a timer for the rest.
  useEffect(() => {
    const timers = quotes
      .filter((quote) => (quote.status ?? 'Pending') === 'Pending' && quote.submittedAt?.toMillis)
      .map((quote) => {
        const elapsed = Date.now() - quote.submittedAt.toMillis();
        const remaining = Math.max(APPROVAL_DELAY_MS - elapsed, 0);
        return window.setTimeout(() => {
          updateDoc(doc(db, 'quotes', quote.id), { status: 'Approved' }).catch((error) =>
            console.error('Failed to auto-approve quote:', error)
          );
        }, remaining);
      });

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [quotes]);

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

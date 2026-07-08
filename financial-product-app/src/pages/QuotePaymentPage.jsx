import './css/QuotePaymentPage.css';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';
import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import PaymentMethod from '../components/Payment Method';
import LoadingSpinner from '../components/LoadingSpinner';

// Mocked gateway processing delay — mirrors the device contract checkout
// at PaymentPage.jsx, minus the real contract-generation call.
const PROCESSING_DELAY_MS = 1500;

export default function QuotePaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const quote = location.state;

  const [isProcessing, setIsProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');

  if (!quote?.quoteId) {
    return (
      <div className="quote-payment-page">
        <Header />
        <div className="quote-payment-page__inner">
          <p className="quote-payment-page__empty">No quote selected.</p>
          <button className="back-btn" onClick={() => navigate('/quotes')} aria-label="Back to quotes">
            <MdArrowBack />
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const { quoteId, title, subtypeLabel, price, category } = quote;
  const isInvestment = category === 'investment';
  const amount = price ?? 0;

  async function handleCheckout() {
    setIsProcessing(true);
    setError('');

    try {
      await new Promise((resolve) => window.setTimeout(resolve, PROCESSING_DELAY_MS));
      await updateDoc(doc(db, 'quotes', quoteId), { paid: true, paidAt: serverTimestamp() });
      setPaid(true);
    } catch (err) {
      console.error('Failed to process quote payment:', err);
      setError('Something went wrong processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="quote-payment-page">
      <Header />
      <div className="quote-payment-page__inner">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <MdArrowBack />
          </button>
          <h1 className="quote-payment-page__title">Complete payment</h1>
        </div>

        {isProcessing ? (
          <div className="quote-payment-page__processing">
            <LoadingSpinner label="Processing your payment…" />
          </div>
        ) : paid ? (
          <div className="quote-payment-page__success">
            <MdCheckCircle className="quote-payment-page__success-icon" />
            <h2>Payment successful</h2>
            <p>Your {title} {isInvestment ? 'investment' : 'policy'} is now active.</p>
            <button
              className="quote-payment-page__done-btn"
              onClick={() => navigate('/quotes', { replace: true })}
            >
              Done
            </button>
          </div>
        ) : (
          <div className="quote-payment-page__body">
            <div className="quote-payment-page__left">
              <p className="quote-payment-page__deal-name">{title}</p>
              {subtypeLabel && (
                <div className="quote-payment-page__deal-row">
                  <span>Category</span>
                  <span>{subtypeLabel}</span>
                </div>
              )}
              <div className="quote-payment-page__deal-row quote-payment-page__deal-row--due">
                <span>{isInvestment ? 'Initial investment' : 'Monthly premium'}</span>
                <span>R{amount.toFixed(2)}{isInvestment ? '' : ' PM'}</span>
              </div>
              {error && <p className="quote-payment-page__error">{error}</p>}
            </div>

            <div className="quote-payment-page__right">
              <section className="quote-payment-page__summary">
                <h3 className="quote-payment-page__summary-title">Order Summary</h3>
                <div className="quote-payment-page__summary-row">
                  <span>{isInvestment ? 'Initial investment' : 'Monthly premium'}</span>
                  <span>R{amount.toFixed(2)}</span>
                </div>
                <div className="quote-payment-page__summary-row quote-payment-page__summary-row--total">
                  <span>Total due today</span>
                  <span>R{amount.toFixed(2)}</span>
                </div>
              </section>
              <PaymentMethod hasItems onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

import './css/PaymentPage.css';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCheckCircle } from 'react-icons/md';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import OrderSummary from '../components/OrderSummary';
import PaymentMethod from '../components/Payment Method';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const deal = location.state;
  const [paid, setPaid] = useState(false);

  if (!deal) {
    return (
      <div className="payment-page">
        <Header />
        <div className="payment-page__inner">
          <p className="payment-page__empty">No deal selected.</p>
          <button className="back-btn" onClick={() => navigate('/devices')} aria-label="Back to devices">
            <MdArrowBack />
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  const { deviceName, colour, providerName, planName, durationMonths, monthlyTotal, deliveryFee } = deal;

  function handleCheckout() {
    setPaid(true);
  }

  return (
    <div className="payment-page">
      <Header />
      <div className="payment-page__inner">
        <div className="page-header">
          <button className="back-btn" onClick={() => navigate(-1)} aria-label="Back">
            <MdArrowBack />
          </button>
          <h1 className="payment-page__title">Pay Upfront</h1>
        </div>

        {paid ? (
          <div className="payment-page__success">
            <MdCheckCircle className="payment-page__success-icon" />
            <h2>Payment successful</h2>
            <p>Your {deviceName} deal is confirmed. We'll be in touch about delivery.</p>
            <button className="payment-page__done-btn" onClick={() => navigate('/list')}>
              Done
            </button>
          </div>
        ) : (
          <div className="payment-page__body">
            <div className="payment-page__left">
              <p className="payment-page__deal-name">{deviceName}</p>
              <div className="payment-page__deal-row">
                <span>Colour</span>
                <span>{colour}</span>
              </div>
              <div className="payment-page__deal-row">
                <span>Network</span>
                <span>{providerName}</span>
              </div>
              <div className="payment-page__deal-row">
                <span>Plan</span>
                <span>{planName}</span>
              </div>
              <div className="payment-page__deal-row">
                <span>Contract duration</span>
                <span>{durationMonths} months</span>
              </div>
              <div className="payment-page__deal-row payment-page__deal-row--due">
                <span>Due upfront (delivery)</span>
                <span>R{deliveryFee.toFixed(2)}</span>
              </div>
            </div>

            <div className="payment-page__right">
              <OrderSummary subtotal={monthlyTotal + deliveryFee} />
              <PaymentMethod hasItems onCheckout={handleCheckout} />
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

export default PaymentPage;

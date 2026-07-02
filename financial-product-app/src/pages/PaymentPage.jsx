import './css/PaymentPage.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCheckCircle, MdDownload } from 'react-icons/md';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import OrderSummary from '../components/OrderSummary';
import PaymentMethod from '../components/Payment Method';
import { sendOrderConfirmation } from '../services/emailService';
import { functions } from '../services/firebase';
import { httpsCallable } from 'firebase/functions';

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const deal = location.state;
  const [paid, setPaid] = useState(false);
  const [contractUrl, setContractUrl] = useState(null);
  const [customerEmail, setCustomerEmail] = useState(null);
  const [customerId, setCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState(null);

  // Order confirmation needs the account holder's email — the app has no shared
  // profile hook, so fetch it the same way AccountPage does.
  useEffect(() => {
    const jwt = localStorage.getItem('jwt');
    if (!jwt) return;

    let active = true;

    fetch('/client/v1/profile', {
      headers: { accept: 'application/json', Authorization: `Bearer ${jwt}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active) {
          setCustomerEmail(data?.email ?? null);
          setCustomerId(data?.id ?? null);
          setCustomerName(data ? `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() || null : null);
        }
      })
      .catch(() => {
        if (active) {
          setCustomerEmail(null);
          setCustomerId(null);
          setCustomerName(null);
        }
      });

    return () => {
      active = false;
    };
  }, []);

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

async function handleCheckout() {
  const orderId = `ORD-${customerId}${Date.now()}`;

  // Build the order object once, use everywhere
  const order = {
    id: orderId,
    customerEmail,
    customerId,
    customerName,
    deviceName,
    colour,
    providerName,
    planName,
    contractMonths: durationMonths,
    monthlyPrice: monthlyTotal,
    deposit: deliveryFee,
    total: monthlyTotal + deliveryFee,
  };

  try {
    // 1. Generate contract PDF
    const generateContract = httpsCallable(functions, 'generateContract');
    const result = await generateContract({ order });

  /*
    sendOrderConfirmation({
      ...order,
      tax: 0,
      contractUrl: result.data.contractUrl, // pass to email if needed
    });
*/
    setContractUrl(result.data.contractUrl);
    setPaid(true);

  } catch (error) {
    console.error('Error during checkout:', error);
  }
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
            <a
              className="payment-page__contract-btn"
              href={contractUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MdDownload /> View / Download Contract
            </a>
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

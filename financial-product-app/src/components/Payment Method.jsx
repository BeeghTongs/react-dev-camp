import './css/PaymentMethod.css';
import { FaPaypal, FaBitcoin, FaCcMastercard } from 'react-icons/fa';

function PaymentMethod({ hasItems }) {
  return (
    <section className="cart-panel">
      <h3 className="cart-panel__title">Payment Method</h3>
      <div className="cart-panel__payment-icons">
        <div className="cart-panel__payment-icon cart-panel__payment-icon--paypal">
          <FaPaypal />
        </div>
        <div className="cart-panel__payment-icon cart-panel__payment-icon--skrill">
          <span className="cart-panel__skrill-text">S</span>
        </div>
        <div className="cart-panel__payment-icon cart-panel__payment-icon--mastercard">
          <FaCcMastercard />
        </div>
        <div className="cart-panel__payment-icon cart-panel__payment-icon--bitcoin">
          <FaBitcoin />
        </div>
      </div>
      <button className="cart-panel__checkout-btn" disabled={!hasItems}>
        Check Out
      </button>
    </section>
  );
}

export default PaymentMethod;

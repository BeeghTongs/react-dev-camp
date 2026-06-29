import './css/CartPage.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { FaPaypal, FaBitcoin, FaCcMastercard } from 'react-icons/fa';
import CartItem from '../components/CartItem';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

const INITIAL_ITEMS = [
  { id: 1, name: 'Samsung Galaxy S23 Ultra S918B/DS 256GB', unitPrice: 524.99, quantity: 2 },
  { id: 2, name: 'JBL Charge 3 Waterproof Portable Bluetooth Speaker', unitPrice: 109.99, quantity: 1 },
  { id: 3, name: 'GARMIN Fenix 7X 010-02541-11 Exclusive Version', unitPrice: 349.99, quantity: 1 },
  { id: 4, name: 'Beats Fit Pro - True Wireless Noise Cancelling Earbuds', unitPrice: 199.99, quantity: 1 },
  { id: 5, name: 'JLab Epic Air Sport ANC True Wireless Earbuds', unitPrice: 99.99, quantity: 1 },
];

const DELIVERY = 29.99;
const TAX = 39.99;

function CartPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState(INITIAL_ITEMS);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal + DELIVERY + TAX;

  const increment = (id) =>
    setItems(items.map((item) => (item.id === id ? { ...item, quantity: item.quantity + 1 } : item)));

  const decrement = (id) =>
    setItems(items.map((item) =>
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item,
    ));

  const remove = (id) => setItems(items.filter((item) => item.id !== id));

  return (
    <div className="cart-page">
      <Header />
      <div className="cart-page__body">

        <div className="cart-page__left">
          <h2 className="cart-page__title">Shopping Cart</h2>

          {items.length > 0 ? (
            <>
              <div className="cart-page__table-header">
                <span className="cart-page__th--product">Product</span>
                <span className="cart-page__th--qty">Quantity</span>
                <span className="cart-page__th--price">Price</span>
              </div>

              <div className="cart-page__items">
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    name={item.name}
                    quantity={item.quantity}
                    price={item.unitPrice}
                    onIncrement={() => increment(item.id)}
                    onDecrement={() => decrement(item.id)}
                    onRemove={() => remove(item.id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="cart-page__empty">Your cart is empty.</p>
          )}

          <div className="cart-page__footer-actions">
            <button className="cart-page__back-btn" onClick={() => navigate(-1)}>
              <MdArrowBack /> Back
            </button>
            {items.length > 0 && (
              <button className="cart-page__cancel-btn" onClick={() => setItems([])}>
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="cart-page__right">

          <section className="cart-panel">
            <h3 className="cart-panel__title">Order Summery</h3>
            <div className="cart-panel__summary">
              <div className="cart-panel__row">
                <span>Delivery</span>
                <span>R{DELIVERY.toFixed(2)}</span>
              </div>
              <div className="cart-panel__row">
                <span>Tax</span>
                <span>R{TAX.toFixed(2)}</span>
              </div>
              <div className="cart-panel__row cart-panel__row--total">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>
          </section>

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
            <button className="cart-panel__checkout-btn" disabled={items.length === 0}>
              Check Out
            </button>
          </section>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}

export default CartPage;

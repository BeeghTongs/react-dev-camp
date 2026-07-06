import './css/CartPage.css';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import OrderSummary from '../components/OrderSummary';
import PaymentMethod from '../components/Payment Method';
import { useCart } from '../services/useCart';
import { getProductImage } from '../services/ImageService';
import LoadingSpinner from '../components/LoadingSpinner';

const ENQUIRY_ROUTES = {
  'device contract': ['/devices'],
  'retail short term insurance': ['/short-term-insurance', { state: { segment: 'Retail' } }],
  'commercial short term insurance': ['/short-term-insurance', { state: { segment: 'Commercial' } }],
  'retail long-term insurance': ['/long-term-insurance', { state: { segment: 'Retail' } }],
  'commercial long-term insurance': ['/long-term-insurance', { state: { segment: 'Commercial' } }],
  'short-term investment product': ['/short-term-investment'],
  'long-term investment product': ['/long-term-investment'],
  'islamic investment product': ['/islamic-investment'],
  'vip investment product': ['/vip-investment'],
};

function CartPage() {
  const navigate = useNavigate();
  const { items, loading, remove, clearCart } = useCart();
  const [showConfirm, setShowConfirm] = useState(false);
  const [images, setImages] = useState({});
  const fetchedIds = useRef(new Set());

  useEffect(() => {
    items.forEach((item) => {
      if (fetchedIds.current.has(item.productId)) return;
      fetchedIds.current.add(item.productId);
      getProductImage(item.productId).then((url) => {
        setImages((prev) => ({ ...prev, [item.productId]: url }));
      });
    });
  }, [items]);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice, 0);

  function handleConfirmCancel() {
    clearCart();
    setShowConfirm(false);
  }

  return (
    <div className="cart-page">
      <Header />
      <div className="cart-page__body">

        <div className="cart-page__left">
          <h2 className="cart-page__title">My Wishlist</h2>

          {loading ? (
            <LoadingSpinner label="Loading your wishlist…" />
          ) : items.length > 0 ? (
            <>
              <div className="cart-page__table-header">
                <span className="cart-page__th--product">Product</span>
                <span aria-hidden="true" />
                <span className="cart-page__th--date">Date Added</span>
                <span aria-hidden="true" />
              </div>

              <div className="cart-page__items">
                {items.map((item) => (
                  <CartItem
                    key={item.productId}
                    image={images[item.productId]}
                    name={item.name}
                    dateAdded={item.addedAt}
                    onImageClick={() => navigate(`/products/${item.productId}`)}
                    onEnquire={() => {
                      const route = ENQUIRY_ROUTES[item.name?.toLowerCase() ?? ''];
                      if (route) navigate(...route);
                    }}
                    onRemove={() => remove(item.productId)}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="cart-page__empty">Your wishlist is empty.</p>
          )}

          {items.length > 0 && (
            <div className="cart-page__footer-actions">
              <button className="cart-page__cancel-btn" onClick={() => setShowConfirm(true)}>
                Remove All Items
              </button>
            </div>
          )}
        </div>

        <div className="cart-page__right">
          {/* <OrderSummary subtotal={subtotal} /> */}
          {/* <PaymentMethod hasItems={items.length > 0} /> */}
        </div>

      </div>
      <BottomNav />

      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-dialog__title">Cancel Order?</h3>
            <p className="confirm-dialog__message">
              This will remove all items from your wishlist. This action cannot be undone.
            </p>
            <div className="confirm-dialog__actions">
              <button className="confirm-dialog__btn confirm-dialog__btn--ghost" onClick={() => setShowConfirm(false)}>
                Keep Order
              </button>
              <button className="confirm-dialog__btn confirm-dialog__btn--danger" onClick={handleConfirmCancel}>
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;

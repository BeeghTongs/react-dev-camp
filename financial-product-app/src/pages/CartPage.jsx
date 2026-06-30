import './css/CartPage.css';
import { useState } from 'react';
import CartItem from '../components/CartItem';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import OrderSummary from '../components/OrderSummary';
import PaymentMethod from '../components/Payment Method';
import { useCart } from '../services/useCart';

function CartPage() {
  const { items, remove, clearCart } = useCart();
  const [showConfirm, setShowConfirm] = useState(false);

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
                    key={item.productId}
                    name={item.name}
                    price={item.unitPrice}
                    onEnquire={() => {}}
                    onRemove={() => remove(item.productId)}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="cart-page__empty">Your cart is empty.</p>
          )}

          {items.length > 0 && (
            <div className="cart-page__footer-actions">
              <button className="cart-page__cancel-btn" onClick={() => setShowConfirm(true)}>
                Cancel Order
              </button>
            </div>
          )}
        </div>

        <div className="cart-page__right">
          <OrderSummary subtotal={subtotal} />
          <PaymentMethod hasItems={items.length > 0} />
        </div>

      </div>
      <BottomNav />

      {showConfirm && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-dialog__title">Cancel Order?</h3>
            <p className="confirm-dialog__message">
              This will remove all items from your cart. This action cannot be undone.
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

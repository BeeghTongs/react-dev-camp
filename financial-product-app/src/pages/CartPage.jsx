import './css/CartPage.css';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import CartItem from '../components/CartItem';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import OrderSummary from '../components/OrderSummary';
import PaymentMethod from '../components/Payment Method';
import { useCart } from '../services/useCart';

function CartPage() {
  const navigate = useNavigate();
  const { items, remove, clearCart } = useCart();

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice, 0);

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

          <div className="cart-page__footer-actions">
            <button className="cart-page__back-btn" onClick={() => navigate(-1)}>
              <MdArrowBack /> Back
            </button>
            {items.length > 0 && (
              <button className="cart-page__cancel-btn" onClick={clearCart}>
                Cancel Order
              </button>
            )}
          </div>
        </div>

        <div className="cart-page__right">
          <OrderSummary subtotal={subtotal} />
          <PaymentMethod hasItems={items.length > 0} />
        </div>

      </div>
      <BottomNav />
    </div>
  );
}

export default CartPage;

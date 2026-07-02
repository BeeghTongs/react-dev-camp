import './css/OrderSummary.css';

const DELIVERY = 0;
const TAX = 0;

function OrderSummary({ subtotal }) {
  const total = subtotal + DELIVERY + TAX;

  return (
    <section className="cart-panel">
      <h3 className="cart-panel__title">Order Summary</h3>
      <div className="cart-panel__summary">
        <div className="cart-panel__row">
          <span>Subtotal</span>
          <span>R{subtotal.toFixed(2)}/mo</span>
        </div>
        {/* <div className="cart-panel__row">
          <span>Delivery</span>
          <span>R{DELIVERY.toFixed(2)}</span>
        </div>
        <div className="cart-panel__row">
          <span>Tax</span>
          <span>R{TAX.toFixed(2)}</span>
        </div> */}
        <div className="cart-panel__row cart-panel__row--total">
          <span>Total</span>
          <span>R{total.toFixed(2)}</span>
        </div>
      </div>
    </section>
  );
}

export default OrderSummary;

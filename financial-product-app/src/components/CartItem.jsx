import './css/CartItem.css';
import { MdDeleteOutline } from 'react-icons/md';

function CartItem({ image, name, quantity, price, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item__image-wrap">
        {image
          ? <img className="cart-item__image" src={image} alt={name} />
          : <div className="cart-item__placeholder" />}
      </div>
      <div className="cart-item__info">
        <p className="cart-item__name">{name}</p>
      </div>
      <div className="cart-item__qty">
        <button className="cart-item__qty-btn" onClick={onDecrement} aria-label="Decrease quantity">-</button>
        <span className="cart-item__qty-count">{quantity}</span>
        <button className="cart-item__qty-btn" onClick={onIncrement} aria-label="Increase quantity">+</button>
      </div>
      <div className="cart-item__price">R{(price * quantity).toFixed(2)}</div>
      <button className="cart-item__remove" onClick={onRemove} aria-label="Remove item">
        <MdDeleteOutline />
      </button>
    </div>
  );
}

export default CartItem;

import './css/CartItem.css';
import { MdDeleteOutline } from 'react-icons/md';

function CartItem({ image, name, price, onEnquire, onRemove }) {
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
      <button className="cart-item__enquire" onClick={onEnquire}>Enquire</button>
      <div className="cart-item__price">R{price.toFixed(2)}</div>
      <button className="cart-item__remove" onClick={onRemove} aria-label="Remove item">
        <MdDeleteOutline />
      </button>
    </div>
  );
}

export default CartItem;

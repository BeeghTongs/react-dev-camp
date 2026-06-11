import './css/ProductListCard.css';

function ProductListCard({ imageUrl, title, price, badge, onClick }) {
  return (
    <button type="button" className="product-list-card" onClick={onClick}>
      <div className="product-list-card__image-wrap">
        {badge ? <span className="product-list-card__badge">{badge}</span> : null}
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="product-list-card__image" />
        ) : (
          <div className="product-list-card__image product-list-card__image--placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="product-list-card__body">
        <h3 className="product-list-card__title">{title}</h3>
        <p className="product-list-card__price">from {price}</p>
      </div>
    </button>
  );
}

export default ProductListCard;
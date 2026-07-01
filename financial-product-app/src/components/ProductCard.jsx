import './css/ProductCard.css';

function ProductCard({imageUrl,title,price,onClick}) {
  return (
    <button type="button" className="product-card" onClick={onClick}>
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="product-card__image" />
      ) : (
        <div className="product-card__image product-card__image--placeholder" aria-hidden="true" />
      )}
      <div className="product-card__body">
        <h3 className="product-card__title">{title}</h3>
        <p className="product-card__price">from {price}</p>
      </div>
    </button>
  );
}

export default ProductCard;
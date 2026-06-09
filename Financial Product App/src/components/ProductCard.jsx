import './ProductCard.css';

function ProductCard({imageUrl,title,price}) {
  return (
    <div className="product-card">
      <img src={imageUrl} alt={title} className="product-card__image" />
      <div className="product-card__body">
        <h3 className="product-card__title">{title}</h3>
        <p className="product-card__price">from {price} p/m</p>
      </div>
    </div>
  );
}

export default ProductCard;
import './css/ProductListCard.css';
import { useEffect, useState } from 'react';
import { getProductImage } from '../services/ImageService';

function ProductListCard({
  id,
  title,
  price,
  badge,
  onClick,
  className = "",
  imageUrl: initialImageUrl = null,
}) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl);

  useEffect(() => {
    if (initialImageUrl) {
      setImageUrl(initialImageUrl);
      return;
    }

    let active = true;

    async function loadImage() {
      try {
        const url = await getProductImage(id);
        if (active) setImageUrl(url);
      } catch (err) {
        console.error(err);
      }
    }

    loadImage();

    return () => {
      active = false;
    };
  }, [id, initialImageUrl]);

  return (
    <button
      type="button"
      className={`product-list-card ${className}`}
      onClick={onClick}
    >
      <div className="product-list-card__image-wrap">
        {badge ? (
          <span className="product-list-card__badge">{badge}</span>
        ) : null}

        {imageUrl ? (
          <img
            src={imageUrl || ''}
            alt={title}
            className="product-list-card__image"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="product-list-card__image product-list-card__image--placeholder" />
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
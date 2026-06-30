import './css/Subscription.css';
import { useEffect, useState } from 'react';
import { getProductImage } from '../services/ImageService';

function Subscription({ productId, name, price, period = 'month', iconBg, iconText, iconEmoji }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!productId) return;
    let active = true;
    getProductImage(productId).then((url) => {
      if (active) setImageUrl(url);
    });
    return () => { active = false; };
  }, [productId]);

  return (
    <div className="subscription-item">
      <div className="subscription-item__icon" style={imageUrl ? {} : { background: iconBg }}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="subscription-item__image" />
        ) : iconEmoji ? (
          <span className="subscription-item__emoji">{iconEmoji}</span>
        ) : (
          <span className="subscription-item__initials">{iconText}</span>
        )}
      </div>
      <div className="subscription-item__info">
        <p className="subscription-item__name">{name}</p>
        <p className="subscription-item__period">{period}ly</p>
      </div>
      <div className="subscription-item__price">
        <span className="subscription-item__amount">R{price.toFixed(2)}</span>
        <span className="subscription-item__per">/{period}</span>
      </div>
    </div>
  );
}

export default Subscription;

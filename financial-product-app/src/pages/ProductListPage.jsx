import './css/ProductListPage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductListCard from '../components/ProductListCard';
import DiscountBadge from '../components/DiscountBadge';
import { MdFingerprint } from 'react-icons/md';
import { getProductImage } from '../services/ImageService';

const recommendedProducts = [
  {
    id: 1,
    title: 'All Mobile Device Contracts',
    price: 'R350 p/m',
    badge: '25% off',
    imageUrl:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    title: 'Smart Home Protection',
    price: 'R420 p/m',
    badge: 'New',
    imageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Travel Cover Essentials',
    price: 'R280 p/m',
    badge: null,
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
];

function ProductListPage() {
  const navigate = useNavigate();
  const [newArrivals, setNewArrivals] = useState([]);

  useEffect(() => {
    let active = true;

    async function fetchNewArrivals() {
      try {
        const response = await fetch('/client/v1/products');

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const products = Array.isArray(data) ? data : data?.items || [];

        const enriched = await Promise.all(
        products.map(async (p) => ({
          ...p,
          imageUrl: await getProductImage(p.id),
        }))
      );

        if (active) {
          setNewArrivals(enriched);
        }
      } catch (error) {
        console.error('Failed to load new arrivals:', error);
        if (active) {
          setNewArrivals([]);
        }
      }
    }

    fetchNewArrivals();

    return () => {
      active = false;
    };
  }, []);

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `R${price} p/m`;
    }

    return price || 'Price unavailable';
  };

  return (
    <div className="product-list-page">
      <header className="product-list-page__header">
        <div className="product-list-page__brand">
          <MdFingerprint className="fingerprint-icon-header"/>
          <span>InsureTechGuard</span>
        </div>
      </header>

      <main className="product-list-page__content">
        <section className="product-list-page__featured">
          <div className="featured-hero" onClick={() => navigate('/products/1')} role="button" tabIndex={0}>
            <DiscountBadge percentage={25} className="featured-hero__badge" />
            <h1>All Mobile Device Contracts</h1>
            <p>Various models available</p>
            <span className="featured-hero__cta">View offers</span>
          </div>
          <div className="featured-hero featured-hero--side" aria-hidden="true" />
        </section>

        <section className="product-section">
          <div className="product-section__header">
            <h2>Recommended to you</h2>
            <button type="button" className="section-link" onClick={() => navigate('/recommended')}>
              View all →
            </button>
          </div>
          <div className="recommended-products">
            {recommendedProducts.map((product) => (
              <ProductListCard
                className="product-card"
                key={product.id}
                imageUrl={product.imageUrl}
                title={product.title}
                price={product.price}
                badge={product.badge}
                onClick={() => navigate(`/products/${product.id}`)}
              />
            ))}
          </div>
        </section>

        <section className="product-section">
          <div className="product-section__header">
            <h2>New arrivals</h2>
            <button type="button" className="section-link" onClick={() => navigate('/new-arrivals')}>
              View all →
            </button>
          </div>
          <div className="new-arrivals">
            {newArrivals.map((product) => (
              <ProductListCard
                className="product-card"
                key={product.id}
                imageUrl={product.imageUrl}
                title={product.name}
                price={formatPrice(product.price)}
                onClick={() => navigate(`/products/${product.id}`)}
              />
            ))}
          </div>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Primary">
        <button type="button" className="bottom-nav__item bottom-nav__item--active">Home</button>
        <button type="button" className="bottom-nav__item">Subscriptions</button>
        <button type="button" className="bottom-nav__item">Cart</button>
        <button type="button" className="bottom-nav__item">Account</button>
      </nav>
    </div>
  );
}

export default ProductListPage;
import './css/GuestListPage.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductListCard from '../components/ProductListCard';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import DiscountBadge from '../components/DiscountBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const categoryFilters = ['All', 'Insurance', 'Investments', 'Accounts'];

function GuestListPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProducts() {
      try {
        const response = await fetch('/client/v1/products');

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const items = Array.isArray(data) ? data : data?.items || [];

        if (active) {
          setProducts(items);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
        if (active) {
          setProducts([]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'All') {
      return products;
    }

    return products.filter((product) => {
      const name = String(product.name || product.title || '').toLowerCase();
      return (
        (activeFilter === 'Insurance' && name.includes('insurance')) ||
        (activeFilter === 'Investments' && name.includes('investment')) ||
        (activeFilter === 'Accounts' && name.includes('account'))
      );
    });
  }, [activeFilter, products]);

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `R${price} p/m`;
    }

    return price || 'Price unavailable';
  };

  return (
    <div className="guest-list-page">
      <Header />

      <main className="guest-list-page__content">
        <section className="guest-list-page__featured">
          <div className="featured-hero" onClick={() => navigate('/mock-data?collection=mobile-contracts')} role="button" tabIndex={0}>
            <DiscountBadge percentage={25} className="featured-hero__badge" />
            <h1>All Mobile Device Contracts</h1>
            <p>Various models available</p>
            <span className="featured-hero__cta">View offers</span>
          </div>
          <div className="featured-hero featured-hero--side" aria-hidden="true" >
            More Coming Soon!
          </div>
        </section>


        <section className="guest-list-page__products">
          <div className="product-section__header">
            <h2>{activeFilter === 'All' ? 'Discover' : activeFilter}</h2>
          </div>
            <section className="guest-list-page__filters" aria-label="Product filters">
                <div className="filter-pill-list">
                    {categoryFilters.map((filter) => (
                    <button
                        type="button"
                        key={filter}
                        className={`filter-pill ${filter === activeFilter ? 'filter-pill--active' : ''}`}
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter}
                    </button>
                    ))}
                </div>
            </section>

          {loading ? (
            <LoadingSpinner label="Loading products…" />
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              No products found for “{activeFilter}”. Please choose another category.
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <ProductListCard
                  key={product.id}
                  id={product.id}
                  imageUrl={product.imageUrl}
                  title={product.name || product.title}
                  price={formatPrice(product.price)}
                  onClick={() => navigate(`/products/${product.id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
        <BottomNav />
    </div>
  );
}

export default GuestListPage;

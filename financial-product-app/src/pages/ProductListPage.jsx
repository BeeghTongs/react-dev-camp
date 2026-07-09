import './css/ProductListPage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdChevronRight } from 'react-icons/md';
import ProductListCard from '../components/ProductListCard';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import DiscountBadge from '../components/DiscountBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';
import { validateToken } from '../services/authService';
import productCatalogue from '../assets/Products.json';

const FULFILMENT_CATEGORY_LABELS = { A: 'Device Contract', B: 'Investment', C: 'Insurance' };

// The backend's own catalogue (e.g. "Retail Short Term Insurance", "Device
// Contract") - matched against Products.json purely to label each result.
function categoryForBackendProduct(name) {
  const match = productCatalogue.find((p) => p.name.toLowerCase() === name?.toLowerCase());
  return FULFILMENT_CATEGORY_LABELS[match?.fulfilmentType] || 'Products';
}

// Static index of every product a shopper can search for across the app -
// subscriptions, investments, insurance and device contracts each live on
// their own page, so this maps a searchable name to where it can be found.
const SEARCH_CATALOG = [
  { id: 'cat-insurance-short', name: 'Short Term Insurance', category: 'Category', route: '/short-term-insurance' },
  { id: 'cat-insurance-long', name: 'Long Term Insurance', category: 'Category', route: '/long-term-insurance' },
  { id: 'cat-investment-short', name: 'Short-Term Investments', category: 'Category', route: '/short-term-investment' },
  { id: 'cat-investment-long', name: 'Long-Term Investments', category: 'Category', route: '/long-term-investment' },
  { id: 'cat-investment-islamic', name: 'Islamic Investments', category: 'Category', route: '/islamic-investment' },
  { id: 'cat-investment-vip', name: 'VIP Investments', category: 'Category', route: '/vip-investment' },
  { id: 'cat-devices', name: 'Device Contracts', category: 'Category', route: '/devices' },
  { id: 'cat-subscriptions', name: 'Subscriptions', category: 'Category', route: '/subscriptions' },

  ...['Electronics Cover', 'Household Items Cover', 'Jewellery Cover', 'Car Insurance'].map((name) => ({
    id: `sti-retail-${name}`, name, category: 'Short Term Insurance', route: '/short-term-insurance', state: { segment: 'Retail', initialQuery: name },
  })),
  ...['Printer Cover', 'Company Car Insurance', 'Theft Cover', 'Office Equipment Cover'].map((name) => ({
    id: `sti-commercial-${name}`, name, category: 'Short Term Insurance', route: '/short-term-insurance', state: { segment: 'Commercial', initialQuery: name },
  })),
  ...['Household Insurance', 'Life Insurance', 'Funeral Cover', 'Disability Cover'].map((name) => ({
    id: `lti-retail-${name}`, name, category: 'Long Term Insurance', route: '/long-term-insurance', state: { segment: 'Retail', initialQuery: name },
  })),
  ...['Office Insurance', 'Employee Benefit Insurance', 'Business Liability Cover', 'Key Person Insurance'].map((name) => ({
    id: `lti-commercial-${name}`, name, category: 'Long Term Insurance', route: '/long-term-insurance', state: { segment: 'Commercial', initialQuery: name },
  })),
  ...['32-Day Fixed Deposit', 'Money Market Account', '91-Day Notice Deposit', 'Flexible Savings Account'].map((name) => ({
    id: `inv-short-${name}`, name, category: 'Short-Term Investments', route: '/short-term-investment', state: { initialQuery: name },
  })),
  ...['Retirement Annuity', 'Unit Trust', 'Provident Fund', 'Endowment Policy'].map((name) => ({
    id: `inv-long-${name}`, name, category: 'Long-Term Investments', route: '/long-term-investment', state: { initialQuery: name },
  })),
  ...['Sukuk Fund', 'Shariah Equity Fund', 'Islamic Fixed Deposit', 'Halal Unit Trust'].map((name) => ({
    id: `inv-islamic-${name}`, name, category: 'Islamic Investments', route: '/islamic-investment', state: { initialQuery: name },
  })),
  ...['Private Wealth Portfolio', 'Offshore Investment Fund', 'Structured Deposit', 'Family Trust Investment'].map((name) => ({
    id: `inv-vip-${name}`, name, category: 'VIP Investments', route: '/vip-investment', state: { initialQuery: name },
  })),
  ...[
    'Apple iPhone 17 256GB 5G', 'Apple iPhone 17 Pro 256GB 5G', 'Samsung Galaxy S25 256GB 5G',
    'Samsung Galaxy A56 128GB 5G', 'HONOR 400 512GB 5G', 'Google Pixel 10 128GB 5G',
    'Apple MacBook Air 15" M4 256GB', 'Dell XPS 14 512GB', 'Lenovo IdeaPad Slim 3 256GB',
  ].map((name) => ({
    id: `device-${name}`, name, category: 'Device Contracts', route: '/devices', state: { initialQuery: name },
  })),
];

const recommendedProducts = [
  {
    id: 1,
    collection: 'mobile-contracts',
    title: 'All Device Contracts',
    price: 'R350 p/m',
    badge: null,
    imageUrl:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    collection: 'smart-home-protection',
    title: 'Smart Home Protection',
    price: 'R420 p/m',
    badge: 'New',
    imageUrl:
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    collection: 'travel-cover-essentials',
    title: 'Travel Cover Essentials',
    price: 'R280 p/m',
    badge: null,
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
];

function ProductListPage() {
  const navigate = useNavigate();
  const [sessionChecked, setSessionChecked] = useState(false);
  const [newArrivals, setNewArrivals] = useState([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    validateToken().then((valid) => {
      if (!valid) {
        localStorage.removeItem('jwt');
        localStorage.removeItem('auth-mode');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      } else {
        setSessionChecked(true);
      }
    });
  }, [navigate]);

  useEffect(() => {
    if (!sessionChecked) return;

    let active = true;
    const jwt = localStorage.getItem('jwt');

    async function fetchNewArrivals() {
      try {
        const response = await fetch('/client/v1/products', {
          headers: { Authorization: `Bearer ${jwt}` },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        const products = Array.isArray(data) ? data : data?.items || [];

        if (active) {
          setNewArrivals(products);
        }
      } catch (error) {
        console.error('Failed to load new arrivals:', error);
        if (active) {
          setNewArrivals([]);
        }
      } finally {
        if (active) {
          setNewArrivalsLoading(false);
        }
      }
    }

    fetchNewArrivals();

    return () => {
      active = false;
    };
  }, [sessionChecked]);

  if (!sessionChecked) {
    return (
      <div className="product-list-page">
        <LoadingSpinner label="Loading…" />
      </div>
    );
  }

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `R${price} p/m`;
    }

    return price || 'Price unavailable';
  };

  const backendCatalog = newArrivals.map((product) => ({
    id: `backend-${product.id}`,
    name: product.name,
    category: categoryForBackendProduct(product.name),
    route: `/products/${product.id}`,
  }));

  const query = search.trim().toLowerCase();
  const searchResults = query
    ? [...SEARCH_CATALOG, ...backendCatalog].filter(
        (item) => item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
      )
    : [];

  const handleResultClick = (item) => {
    navigate(item.route, item.state ? { state: item.state } : undefined);
  };

  return (
    <div className="product-list-page">
      <Header />
      <main className="product-list-page__content">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search subscriptions, investments, insurance, devices…"
        />

        {query ? (
          <section className="product-section search-results">
            {searchResults.length > 0 ? (
              <div className="search-results__list">
                {searchResults.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className="search-results__row"
                    onClick={() => handleResultClick(item)}
                  >
                    <span className="search-results__text">
                      <span className="search-results__name">{item.name}</span>
                      <span className="search-results__category">{item.category}</span>
                    </span>
                    <MdChevronRight className="search-results__chevron" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="search-results__empty">No products match "{search}".</p>
            )}
          </section>
        ) : (
          <>
            <section className="product-list-page__featured">
              <div className="featured-hero" onClick={() => navigate('/devices')} role="button" tabIndex={0}>
                <DiscountBadge percentage={25} className="featured-hero__badge" />
                <h1>All Device Contracts</h1>
                <p>Various models available</p>
                <span className="featured-hero__cta">View offers</span>
              </div>
                <div className="featured-hero featured-hero--side" aria-hidden="true" >
                  More Coming Soon!
                </div>
            </section>

            <section className="product-section">
              <div className="product-section__header">
                <h2>Recommended to you</h2>
                <button type="button" className="section-link" onClick={() => navigate('/recommended')}>
                  View All
                </button>
              </div>
              <div className="recommended-products">
                {recommendedProducts.map((product) => (
                  <ProductListCard
                    id={product.id}
                    key={product.id}
                    imageUrl={product.imageUrl} // optional fallback
                    title={product.title}
                    price={product.price}
                    badge={product.badge}
                    onClick={() => navigate(`/mock-data?collection=${product.collection}`)}
                    className="product-card"
                  />
                ))}
              </div>
            </section>

            <section className="product-section">
              <div className="product-section__header">
                <h2>New arrivals</h2>
                <button type="button" className="section-link" onClick={() => navigate('/new-arrivals')}>
                  View All
                </button>
              </div>
              {newArrivalsLoading ? (
                <LoadingSpinner label="Loading new arrivals…" />
              ) : (
                <div className="new-arrivals">
                  {newArrivals.map((product) => (
                    <ProductListCard
                      id={product.id}
                      key={product.id}
                      title={product.name}
                      price={formatPrice(product.price)}
                      onClick={() => navigate(`/products/${product.id}`)}
                      className="product-card"
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
        <BottomNav />
    </div>
  );
}

export default ProductListPage;
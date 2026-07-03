import './css/SubscriptionsPage.css';
import { useEffect, useState } from 'react';
import { MdAttachMoney, MdAdd } from 'react-icons/md';
import { ImFileEmpty } from "react-icons/im";
import { useNavigate } from 'react-router-dom';
import Subscription from '../components/Subscription';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';
import { validateToken } from '../services/authService';

const mockSubscriptions = [
  { subscriptionId: 1, product: [{ id: 1, name: 'YouTube Premium', description: 'Ad-free videos and music', price: 24.00, imageUrl: '' }] },
  { subscriptionId: 2, product: [{ id: 2, name: 'Crunchyroll', description: 'Anime streaming service', price: 19.99, imageUrl: '' }] },
  { subscriptionId: 3, product: [{ id: 3, name: 'Framer', description: 'Web design and prototyping', price: 57.11, imageUrl: '' }] },
  { subscriptionId: 4, product: [{ id: 4, name: 'CapCut Pro', description: 'Video editing suite', price: 32.90, imageUrl: '' }] },
];

const ICON_COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706',
  '#dc2626', '#7c3aed', '#db2777', '#0284c7',
];

function iconBgFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return ICON_COLORS[Math.abs(hash) % ICON_COLORS.length];
}

function iconTextFromName(name) {
  const words = name.trim().split(/\s+/);
  return words.length >= 2
    ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [sessionChecked, setSessionChecked] = useState(false);
  const navigate = useNavigate();

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

    const controller = new AbortController();

    async function fetchSubscriptions() {
      try {
        const response = await fetch('/client/v1/subscriptions', {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwt')}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
         setSubscriptions(data?.subscriptions ?? []);
        //setSubscriptions(mockSubscriptions)
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching subscriptions:', error);
        }
      }
    }

    fetchSubscriptions();

    return () => controller.abort();
  }, [sessionChecked]);

  if (!sessionChecked) {
    return (
      <div className="subscriptions-page">
        <LoadingSpinner label="Loading subscriptions…" />
      </div>
    );
  }

  const totalMonthly = subscriptions.reduce((sum, s) => sum + (s.product?.[0]?.price ?? 0), 0);



  return (
    <div className="subscriptions-page">
      <Header />
      <header className="subscriptions-page__header">
        <h1 className="subscriptions-page__title">Subscriptions</h1>
      </header>

      <main className="subscriptions-page__content">
        <div className="subscriptions-summary-card">
          <div className="subscriptions-summary-card__top">
            <div className="subscriptions-summary-card__label-row">
              <span className="subscriptions-summary-card__dollar-icon">
                <MdAttachMoney />
              </span>
              <span className="subscriptions-summary-card__label">Total Monthly</span>
            </div>
            <p className="subscriptions-summary-card__amount">R {totalMonthly.toFixed(2)}</p>
            <p className="subscriptions-summary-card__sub">
              Across {subscriptions.length} subscriptions
            </p>
          </div>

          <div className="subscriptions-summary-card__stats">
            <div className="subscriptions-summary-card__stat">
              <p className="subscriptions-summary-card__stat-label">Next Due</p>
              <p className="subscriptions-summary-card__stat-sub">
                Jul 1 &nbsp;<strong>R {(subscriptions[0]?.product?.[0]?.price ?? 0).toFixed(2)}</strong>
              </p>
            </div>
          </div>
        </div>

        <section className="subscriptions-list-section">
          <div className="subscriptions-list">
            <div className="subscriptions-list-section__header">
              <h2 className="subscriptions-list-section__title">Your Subscriptions</h2>
              <button type="button" className="subscriptions-list-section__add" onClick={() => navigate('/list')}>
                <MdAdd /> Add
              </button>
            </div>
            {subscriptions.length === 0 ? (
              <div className="subscriptions-empty">
                <ImFileEmpty size={50} />
                <p className="subscriptions-empty__title">No subscriptions yet</p>
                <p className="subscriptions-empty__sub">Tap <strong>Add</strong> to track your first subscription.</p>
              </div>
            ) : (
              subscriptions.map((sub) => {
                const product = sub.product?.[0];
                if (!product) return null;
                const name = product.name;
                return (
                  <Subscription
                    key={sub.subscriptionId}
                    productId={product.id}
                    name={name}
                    price={product.price}
                    iconBg={iconBgFromName(name)}
                    iconText={iconTextFromName(name)}
                  />
                );
              })
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}

export default SubscriptionsPage;

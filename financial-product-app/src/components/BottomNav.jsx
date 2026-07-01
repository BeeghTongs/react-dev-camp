import './css/BottomNav.css';
import { useState } from 'react';
import {
  MdHome,
  MdSubscriptions,
  MdFavoriteBorder,
  MdPerson,
} from 'react-icons/md';
import { GoRepoLocked } from "react-icons/go";
import { useLocation, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const isGuest = localStorage.getItem('auth-mode') === 'guest';

  const getHomeRoute = () => {
    const authMode = localStorage.getItem('auth-mode');
    const storedUser = localStorage.getItem('user');

    if (authMode === 'guest') {
      return '/guest-list';
    }

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser?.isGuest === true) {
          return '/guest-list';
        }
      } catch (error) {
        console.warn('Unable to parse stored user data:', error);
      }
    }

    return '/list';
  };

  const isHomeActive = ['/list', '/guest-list', '/'].includes(location.pathname);
  const isAccountActive = location.pathname === '/account';
  const isSubscriptionsActive = location.pathname === '/subscriptions';

  return (
    <>
    <nav className="bottom-nav" aria-label="Primary">
      <button
        type="button"
        className={`bottom-nav__item${isHomeActive ? ' bottom-nav__item--active' : ''}`}
        onClick={() => navigate(getHomeRoute())}
      >
        <MdHome />
        Home
      </button>
      <button
        type="button"
        className={`bottom-nav__item${isSubscriptionsActive ? ' bottom-nav__item--active' : ''}`}
        onClick={() => isGuest ? setShowGuestModal(true) : navigate('/subscriptions')}
      >
        <MdSubscriptions />
        Subscriptions
      </button>
      <button
        type="button"
        className={`bottom-nav__item${location.pathname === '/cart' ? ' bottom-nav__item--active' : ''}`}
        onClick={() => navigate('/cart')}
      >
        <MdFavoriteBorder />
        Wishlist
      </button>
      <button
        type="button"
        className={`bottom-nav__item${isAccountActive ? ' bottom-nav__item--active' : ''}`}
        onClick={() => navigate('/account')}
      >
        <MdPerson />
        Account
      </button>
    </nav>

    {showGuestModal && (
      <div className="guest-modal-overlay" onClick={() => setShowGuestModal(false)}>
        <div className="guest-modal" onClick={(e) => e.stopPropagation()}>
          <GoRepoLocked className="guest-modal__icon" />
          <h2 className="guest-modal__title">Sign in required</h2>
          <p className="guest-modal__body">
            You need to be logged in to view and manage your subscriptions.
          </p>
          <button
            type="button"
            className="guest-modal__signin"
            onClick={() => {
              setShowGuestModal(false);
              setShowLoginModal(true);
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className="guest-modal__dismiss"
            onClick={() => setShowGuestModal(false)}
          >
            Maybe later
          </button>
        </div>
      </div>
    )}

    {showLoginModal && (
      <LoginModal
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          navigate('/subscriptions');
        }}
      />
    )}
    </>
  );
}

export default BottomNav;
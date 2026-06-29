import './css/BottomNav.css';
import {
  MdHome,
  MdSubscriptions,
  MdShoppingCart,
  MdPerson,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';

function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

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
        onClick={() => navigate('/subscriptions')}
      >
        <MdSubscriptions />
        Subscriptions
      </button>
      <button type="button" className="bottom-nav__item">
        <MdShoppingCart />
        Cart
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
  );
}

export default BottomNav;
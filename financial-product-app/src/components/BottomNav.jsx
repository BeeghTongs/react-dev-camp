import './css/BottomNav.css';
import {
  MdHome,
  MdSubscriptions,
  MdShoppingCart,
  MdPerson,
} from "react-icons/md";

function BottomNav() {
    return (
        <nav className="bottom-nav" aria-label="Primary">
        <button type="button" className="bottom-nav__item bottom-nav__item--active">
          <MdHome/>
          Home
          </button>
        <button type="button" className="bottom-nav__item">
          <MdSubscriptions/>
          Subscriptions
        </button>
        <button type="button" className="bottom-nav__item">
          <MdShoppingCart/>
          Cart
        </button>
        <button type="button" className="bottom-nav__item">
          <MdPerson/>
          Account
        </button>
      </nav>
    );
}

export default BottomNav;
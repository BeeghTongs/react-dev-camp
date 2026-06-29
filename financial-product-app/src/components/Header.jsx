import './css/Header.css';
import { MdFingerprint } from 'react-icons/md';

function Header() {
  return (
      <header className="product-list-page__header">
        <div className="product-list-page__brand">
          <MdFingerprint className="fingerprint-icon-header"/>
          <span>InsureTechGuard</span>
        </div>
      </header>
  );
}

export default Header;
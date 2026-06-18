import './css/AccountPage.css';
import { useNavigate } from 'react-router-dom';
import { MdFingerprint } from 'react-icons/md';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function AccountPage() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Firebase sign-out failed:', error);
    }

    localStorage.removeItem('jwt');
    localStorage.removeItem('auth-mode');
    localStorage.removeItem('user');

    navigate('/login', { replace: true });
  };

  return (
    <div className="account-page">
      <main className="account-card">
        <div className="account-card__brand-wrap">
          <div className="account-card__logo" aria-hidden="true">
            <MdFingerprint />
          </div>
          <h1 className="account-card__title">Account</h1>
          <p className="account-card__subtitle">More will be added later.</p>
        </div>

        <div className="account-card__actions">
          <button
            type="button"
            className="account-card__signout-button"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </main>
    </div>
  );
}

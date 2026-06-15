import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdFingerprint } from 'react-icons/md';
import LoginForm from '../components/LoginForm.jsx';
import './css/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  const handleSignUp = () => {
    navigate('/');
  };

  const handleContinueAsGuest = () => {
    navigate('/list');
  };

  return (
    <main className="login-page" aria-label="Login page">
      <section className="login-card" aria-label="Authentication panel">
        <div className="login-card__brand-wrap">
          <div className="login-card__logo" aria-hidden="true">
            <MdFingerprint />
          </div>
          <h1 className="login-card__title">InsureTechGuard</h1>
        </div>

        <div className="login-card__actions">
          <button type="button" className="login-card__login-btn" onClick={handleLoginClick}>
            Login
          </button>

          <p className="login-card__meta">
            Don&apos;t have an account?{' '}
            <button type="button" className="login-card__inline-link" onClick={handleSignUp}>
              Sign up
            </button>
          </p>

          <button
            type="button"
            className="login-card__guest-btn"
            onClick={handleContinueAsGuest}
          >
            Continue as guest
          </button>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div
          className="login-modal__overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Login form"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="login-modal__content">
            <LoginForm onSuccess={() => navigate('/list')} onClose={handleCloseModal} />
          </div>
        </div>
      )}
    </main>
  );
}

export default LoginPage;
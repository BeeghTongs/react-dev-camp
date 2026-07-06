import { useState } from 'react';
import { GoRepoLocked } from 'react-icons/go';
import LoginModal from '../components/LoginModal';

// Gate an action behind sign-in for guest users, reusing the same
// guest-modal / login-modal flow as BottomNav and DeviceContractPage.
export function useGuestGate(message) {
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isGuest = localStorage.getItem('auth-mode') === 'guest';

  function requireAuth(action) {
    if (isGuest) {
      setShowGuestModal(true);
      return;
    }
    action?.();
  }

  const modal = (
    <>
      {showGuestModal && (
        <div className="guest-modal-overlay" onClick={() => setShowGuestModal(false)}>
          <div className="guest-modal" onClick={(e) => e.stopPropagation()}>
            <GoRepoLocked className="guest-modal__icon" />
            <h2 className="guest-modal__title">Sign in required</h2>
            <p className="guest-modal__body">{message}</p>
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
          onSuccess={() => setShowLoginModal(false)}
        />
      )}
    </>
  );

  return { requireAuth, modal };
}

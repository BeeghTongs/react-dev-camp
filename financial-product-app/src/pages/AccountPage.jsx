import './css/AccountPage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdFingerprint } from 'react-icons/md';
import { signOut } from 'firebase/auth';
import { ref, listAll } from 'firebase/storage';
import { auth, storage } from '../services/firebase';
import BottomNav from '../components/BottomNav';

export default function AccountPage() {
  const navigate = useNavigate();

  const isGuest = localStorage.getItem('auth-mode') === 'guest';

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  })();

  const userId = user?.id ?? null;

  const [kycStatus, setKycStatus] = useState(() =>
    isGuest || !userId ? 'none' : 'loading'
  );

  useEffect(() => {
    if (isGuest || !userId) return;

    listAll(ref(storage, `kyc/${userId}`))
      .then((result) => {
        const hasDocuments = result.prefixes.length > 0 || result.items.length > 0;
        setKycStatus(hasDocuments ? 'uploaded' : 'pending');
      })
      .catch(() => setKycStatus('pending'));
  }, [isGuest, userId]);

  const displayName = user ? `${user.firstName} ${user.lastName}` : null;
  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : null;

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
          {!isGuest && initials ? (
            <div className="account-card__avatar" aria-hidden="true">
              {initials}
            </div>
          ) : (
            <div className="account-card__logo" aria-hidden="true">
              <MdFingerprint />
            </div>
          )}

          <h1 className="account-card__title">
            {!isGuest && displayName ? displayName : 'Account'}
          </h1>

          {!isGuest && user?.email ? (
            <p className="account-card__email">{user.email}</p>
          ) : (
            <p className="account-card__subtitle">Browsing as guest.</p>
          )}
        </div>

        <div className="account-card__actions">
          {kycStatus === 'pending' && (
            <button
              type="button"
              className="account-card__signout-button"
              onClick={() => navigate('/identity-verification')}
            >
              Complete identity verification
            </button>
          )}
          {kycStatus === 'uploaded' && (
            <div className="account-card__kyc-badge">
              Documents submitted — verification in progress
            </div>
          )}
          {kycStatus === 'loading' && (
            <div className="account-card__kyc-badge account-card__kyc-badge--loading">
              Checking verification status…
            </div>
          )}
          <button
            type="button"
            className="account-card__signout-button account-card__signout-button--ghost"
            onClick={handleSignOut}
          >
            Sign out
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

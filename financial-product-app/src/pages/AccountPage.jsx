import './css/AccountPage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdFingerprint } from 'react-icons/md';
import { signOut } from 'firebase/auth';
import { ref, listAll } from 'firebase/storage';
import { auth, storage } from '../services/firebase';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';

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

  const [kycStatus, setKycStatus] = useState(() => {
    if (isGuest || !user?.email) return 'none';
    if (!localStorage.getItem('jwt')) return 'pending';
    return 'loading';
  });

  useEffect(() => {
    if (isGuest || !user?.email) return;

    const jwt = localStorage.getItem('jwt');
    if (!jwt) return;

    // Re-verify the user's identity via the backend JWT before touching Storage.
    // This prevents a tampered localStorage id from querying another user's folder.
    fetch(`/v1/customer?emailAddress=${encodeURIComponent(user.email)}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((verified) => listAll(ref(storage, `kyc/${verified.id}`)))
      .then((result) => {
        const hasDocuments = result.prefixes.length > 0 || result.items.length > 0;
        setKycStatus(hasDocuments ? 'uploaded' : 'pending');
      })
      .catch(() => setKycStatus('pending'));
  }, [isGuest, user?.email]);

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
      <Header />
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
          {isGuest && (
            <button
              type="button"
              className="account-card__signout-button"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
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

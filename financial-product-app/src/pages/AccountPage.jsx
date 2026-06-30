import './css/AccountPage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdFingerprint } from 'react-icons/md';
import { signOut } from 'firebase/auth';
import { ref, listAll } from 'firebase/storage';
import { auth, storage } from '../services/firebase';
import { validateToken } from '../services/authService';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';

export default function AccountPage() {
  const navigate = useNavigate();

  const isGuest = localStorage.getItem('auth-mode') === 'guest';

  const [sessionChecked, setSessionChecked] = useState(isGuest);
  const [profile, setProfile] = useState(null);
  const [kycStatus, setKycStatus] = useState(isGuest ? 'none' : 'loading');

  // 1. Validate token
  useEffect(() => {
    if (isGuest) return;

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
  }, [isGuest, navigate]);

  // 2. Fetch profile from API once session is confirmed
  useEffect(() => {
    if (!sessionChecked || isGuest) return;

    const jwt = localStorage.getItem('jwt');

    fetch('/client/v1/profile', {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Profile fetch failed: ' + res.status);
        return res.json();
      })
      .then((data) => {
        console.debug('[AccountPage] Profile loaded:', data);
        setProfile(data);
      })
      .catch((err) => {
        console.error('[AccountPage] Failed to load profile:', err);
        navigate('/login', { replace: true });
      });
  }, [sessionChecked, isGuest, navigate]);

  // 3. Check KYC storage once we have the profile id
  useEffect(() => {
    if (!profile?.id) return;

    listAll(ref(storage, `kyc/${profile.id}`))
      .then((result) => {
        const hasDocuments = result.prefixes.length > 0 || result.items.length > 0;
        setKycStatus(hasDocuments ? 'uploaded' : 'pending');
      })
      .catch(() => setKycStatus('pending'));
  }, [profile?.id]);

  if (!sessionChecked || (!isGuest && !profile)) return null;

  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : null;
  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : null;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Firebase sign-out failed:', error);
    }

    localStorage.removeItem('jwt');
    localStorage.removeItem('auth-mode');

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

          {!isGuest && profile?.email ? (
            <p className="account-card__email">{profile.email}</p>
          ) : (
            <p className="account-card__subtitle">Browsing as guest.</p>
          )}

          {!isGuest && profile?.customerType?.name && (
            <span className="account-card__type-badge">
              {profile.customerType.name.charAt(0) + profile.customerType.name.slice(1).toLowerCase()}
            </span>
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

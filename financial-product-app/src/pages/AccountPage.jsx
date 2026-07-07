import './css/AccountPage.css';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdFingerprint, MdCheckCircle } from 'react-icons/md';
import { signOut, deleteUser } from 'firebase/auth';
import { ref, listAll, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../services/firebase';
import { validateToken, clearGuestWishlist } from '../services/authService';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import LoginModal from '../components/LoginModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ReuploadModal from '../components/ReuploadModal';

export default function AccountPage() {
  const navigate = useNavigate();

  const isGuest = localStorage.getItem('auth-mode') === 'guest';

  const [sessionChecked, setSessionChecked] = useState(isGuest);
  const [profile, setProfile] = useState(null);
  const [kycStatus, setKycStatus] = useState(isGuest ? 'none' : 'loading');
  const [kycDocuments, setKycDocuments] = useState([]);
  const [kycDocsLoading, setKycDocsLoading] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [reuploadFolder, setReuploadFolder] = useState(null);
  const [showReuploadToast, setShowReuploadToast] = useState(false);

  useEffect(() => {
    if (!showReuploadToast) return;
    const timer = setTimeout(() => setShowReuploadToast(false), 2500);
    return () => clearTimeout(timer);
  }, [showReuploadToast]);

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
        setProfile(data);
      })
      .catch((err) => {
        console.error('[AccountPage] Failed to load profile:', err);
        navigate('/login', { replace: true });
      });
  }, [sessionChecked, isGuest, navigate]);

  // 3. Check KYC storage once we have the profile id, and load the uploaded
  // documents themselves so the user can view what was submitted.
  useEffect(() => {
    if (!profile?.id) return;

    const kycRef = ref(storage, `kyc/${profile.id}`);

    listAll(kycRef)
      .then(async (result) => {
        const hasDocuments = result.prefixes.length > 0 || result.items.length > 0;
        setKycStatus(hasDocuments ? 'uploaded' : 'pending');
        if (!hasDocuments) return;

        setKycDocsLoading(true);
        try {
          const folderRefs = result.prefixes.length > 0 ? result.prefixes : [kycRef];
          const folderResults = await Promise.all(folderRefs.map((folderRef) => listAll(folderRef)));
          const itemRefs = result.prefixes.length > 0
            ? folderResults.flatMap((folderResult) => folderResult.items)
            : result.items;

          const docs = await Promise.all(
            itemRefs.map(async (itemRef) => ({
              path: itemRef.fullPath,
              name: itemRef.name,
              folder: itemRef.parent?.name,
              url: await getDownloadURL(itemRef),
            }))
          );
          setKycDocuments(docs);
        } catch (error) {
          console.error('[AccountPage] Failed to load KYC documents:', error);
        } finally {
          setKycDocsLoading(false);
        }
      })
      .catch(() => setKycStatus('pending'));
  }, [profile?.id]);

  const kycFolderLabel = (folder) => {
    if (folder === 'proof-of-residence') return 'Proof of residence';
    if (folder === 'selfie') return 'Selfie';
    return folder;
  };

  const handleDocumentReuploaded = (doc) => {
    setKycDocuments((current) => [...current.filter((entry) => entry.folder !== doc.folder), doc]);
    setReuploadFolder(null);
    setShowReuploadToast(true);
  };

  if (!sessionChecked || (!isGuest && !profile)) {
    return (
      <div className="account-page">
        <LoadingSpinner label="Loading account…" />
      </div>
    );
  }

  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : null;
  const initials = profile
    ? `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`.toUpperCase()
    : null;

  const handleSignOut = async () => {
    try {
      if (isGuest && auth.currentUser) {
        // Guests have no real account to sign back into — remove their wishlist
        // and the anonymous Firebase identity entirely instead of leaving them parked.
        await clearGuestWishlist(auth.currentUser.uid);
        await deleteUser(auth.currentUser);
      } else {
        await signOut(auth);
      }
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
              onClick={() => navigate('/identity-verification', { state: { returnTo: { pathname: '/account' } } })}
            >
              Complete identity verification
            </button>
          )}
          {kycStatus === 'uploaded' && (
            <div className="account-card__kyc-section">
              <div className="account-card__kyc-badge">
                Documents submitted — verification in progress
              </div>

              {kycDocsLoading ? (
                <p className="account-card__kyc-docs-loading">Loading your documents…</p>
              ) : kycDocuments.length > 0 ? (
                <ul className="account-card__kyc-doc-list">
                  {kycDocuments.map((doc) => (
                    <li key={doc.folder} className="account-card__kyc-doc-item">
                      <span className="account-card__kyc-doc-name">{kycFolderLabel(doc.folder)}</span>
                      <span className="account-card__kyc-doc-item-actions">
                        <a
                          className="account-card__kyc-doc-view"
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                        <button
                          type="button"
                          className="account-card__kyc-doc-reupload"
                          onClick={() => setReuploadFolder(doc.folder)}
                        >
                          Reupload
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
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
              onClick={() => setShowLoginModal(true)}
            >
              Sign in
            </button>
          )}
          {!isGuest && (
            <button
              type="button"
              className="account-card__signout-button account-card__signout-button--ghost"
              onClick={() => navigate('/orders')}
            >
              My Orders
            </button>
          )}
          <button
            type="button"
            className="account-card__signout-button account-card__signout-button--ghost"
            onClick={() => setShowSignOutConfirm(true)}
          >
            Sign out
          </button>
        </div>
      </main>
      <BottomNav />

      {showSignOutConfirm && (
        <div className="confirm-overlay" onClick={() => setShowSignOutConfirm(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirm-dialog__title">Sign out?</h3>
            <p className="confirm-dialog__message">
              {isGuest
                ? 'This will delete your guest session and wishlist — they cannot be recovered.'
                : 'You will need to sign in again to access your account.'}
            </p>
            <div className="confirm-dialog__actions">
              <button
                type="button"
                className="confirm-dialog__btn confirm-dialog__btn--ghost"
                onClick={() => setShowSignOutConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-dialog__btn confirm-dialog__btn--danger"
                onClick={handleSignOut}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      )}

      {reuploadFolder && (
        <ReuploadModal
          userId={profile.id}
          documentType={reuploadFolder}
          documentLabel={kycFolderLabel(reuploadFolder)}
          onClose={() => setReuploadFolder(null)}
          onUploaded={handleDocumentReuploaded}
        />
      )}

      {showReuploadToast && (
        <div className="account-page-toast" role="status">
          <MdCheckCircle className="account-page-toast__icon" />
          Document reuploaded successfully
        </div>
      )}
    </div>
  );
}

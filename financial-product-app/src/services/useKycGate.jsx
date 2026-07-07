import { useLocation, useNavigate } from 'react-router-dom';
import { useGuestGate } from './useGuestGate';
import { getProfileId } from './authService';
import { hasKycDocuments } from './uploadService';

// Insurance and investment products require KYC verification: guests are
// prompted to sign in (via useGuestGate), and signed-in users without
// submitted KYC documents are sent to identity verification instead.
export function useKycGate(message) {
  const navigate = useNavigate();
  const location = useLocation();
  const { requireAuth, modal } = useGuestGate(message);

  function requireVerification(action) {
    requireAuth(async () => {
      const userId = await getProfileId();
      const verified = await hasKycDocuments(userId);

      if (verified) {
        action?.();
      } else {
        navigate('/identity-verification', {
          state: {
            returnTo: { pathname: location.pathname, search: location.search, state: location.state },
          },
        });
      }
    });
  }

  return { requireVerification, modal };
}

import { useNavigate } from 'react-router-dom';
import { useGuestGate } from './useGuestGate';
import { getProfileId } from './authService';
import { hasKycDocuments } from './uploadService';

// Insurance products additionally require KYC verification: guests are
// prompted to sign in (via useGuestGate), and signed-in users without
// submitted KYC documents are sent to identity verification instead.
export function useKycGate(message) {
  const navigate = useNavigate();
  const { requireAuth, modal } = useGuestGate(message);

  function requireVerification(action) {
    requireAuth(async () => {
      const userId = await getProfileId();
      const verified = await hasKycDocuments(userId);

      if (verified) {
        action?.();
      } else {
        navigate('/identity-verification');
      }
    });
  }

  return { requireVerification, modal };
}

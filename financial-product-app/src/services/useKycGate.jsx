import { useLocation, useNavigate } from 'react-router-dom';
import { useGuestGate } from './useGuestGate';
import { getProfileId } from './authService';
import { hasKycDocuments } from './uploadService';

// Insurance and investment products require KYC verification: guests are
// prompted to sign in (via useGuestGate), and signed-in users without
// submitted KYC documents are sent to identity verification instead.
//
// `target` is the { pathname, state } of the page the product enquiry
// leads to (the insurance questionnaire or the FICA page). Verified users
// are sent straight there; unverified users are sent to KYC first, which
// continues on to `target` once documents are uploaded — so nobody has to
// re-click the product after finishing verification. Declining KYC
// ("Not now") falls back to the page they enquired from instead.
export function useKycGate(message) {
  const navigate = useNavigate();
  const location = useLocation();
  const { requireAuth, modal } = useGuestGate(message);

  function requireVerification(target) {
    requireAuth(async () => {
      const userId = await getProfileId();
      const verified = await hasKycDocuments(userId);

      if (verified) {
        navigate(target.pathname, { state: target.state });
      } else {
        navigate('/identity-verification', {
          state: {
            returnTo: { pathname: location.pathname, search: location.search, state: location.state },
            continueTo: { pathname: target.pathname, state: target.state },
          },
        });
      }
    });
  }

  return { requireVerification, modal };
}

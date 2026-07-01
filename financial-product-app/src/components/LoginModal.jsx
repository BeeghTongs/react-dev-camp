import './css/LoginModal.css';
import LoginForm from './LoginForm';
import { completeLogin } from '../services/authService';

function LoginModal({ onClose, onSuccess }) {
  const handleLoginSuccess = async (jwt, email) => {
    await completeLogin(jwt, email);
    onSuccess?.();
  };

  return (
    <div
      className="login-modal__overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Login form"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="login-modal__content">
        <LoginForm onSuccess={handleLoginSuccess} onClose={onClose} />
      </div>
    </div>
  );
}

export default LoginModal;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdFingerprint, MdClose, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import './css/LoginForm.css';

function LoginForm({ onSuccess, onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (authError) setAuthError('');
  };

  const handleSignUpClick = () => {
    onClose?.();
    navigate('/sign-up');
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const validationErrors = validate();
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  setIsLoading(true);
  setAuthError('');

  try {
    const credentials = btoa(`${formData.email}:${formData.password}`);

    const response = await fetch('/v1/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();

    const jwt = data.loginAccessKey;

    onSuccess?.(jwt,formData.email);
  } catch (error) {
    console.error('Login failed:', error);
    setAuthError('Incorrect email or password. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="login-form">
      {/* Header */}
      <div className="login-form__header">
        <div className="login-form__logo" aria-hidden="true">
          <MdFingerprint />
        </div>
        <div>
          <h2 className="login-form__title">Welcome back</h2>
          <p className="login-form__subtitle">Sign in to InsureTechGuard</p>
        </div>
        {onClose && (
          <button
            type="button"
            className="login-form__close"
            onClick={onClose}
            aria-label="Close"
          >
            <MdClose />
          </button>
        )}
      </div>

      {/* Auth-level error */}
      {authError && (
        <div className="login-form__auth-error" role="alert">
          {authError}
        </div>
      )}

      {/* Form */}
      <form className="login-form__body" onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className={`login-form__field ${errors.email ? 'login-form__field--error' : ''}`}>
          <label className="login-form__label" htmlFor="email">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="login-form__input"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            disabled={isLoading}
          />
          {errors.email && (
            <span className="login-form__error" role="alert">
              {errors.email}
            </span>
          )}
        </div>

        {/* Password */}
        <div className={`login-form__field ${errors.password ? 'login-form__field--error' : ''}`}>
          <div className="login-form__label-row">
            <label className="login-form__label" htmlFor="password">
              Password
            </label>
            <button type="button" className="login-form__forgot">
              Forgot password?
            </button>
          </div>
          <div className="login-form__input-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="login-form__input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <button
              type="button"
              className="login-form__toggle-pw"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>
          {errors.password && (
            <span className="login-form__error" role="alert">
              {errors.password}
            </span>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="login-form__submit"
          disabled={isLoading}
        >
          {isLoading ? <span className="login-form__spinner" aria-hidden="true" /> : null}
          {isLoading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="login-form__signup">
        Don&apos;t have an account?{' '}
        <button type="button" className="login-form__signup-link" onClick={handleSignUpClick}>
          Sign up
        </button>
      </p>
    </div>
  );
}

export default LoginForm;
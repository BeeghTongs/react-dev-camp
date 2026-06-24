import { useState } from 'react'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import './css/PasswordCreation.css'

const requirements = [
  { key: 'lowercase', label: 'one lowercase character', test: (value) => /[a-z]/.test(value) },
  { key: 'uppercase', label: 'one uppercase character', test: (value) => /[A-Z]/.test(value) },
  { key: 'digit', label: 'one number/digit', test: (value) => /[0-9]/.test(value) },
  { key: 'symbol', label: 'one special symbol', test: (value) => /[^A-Za-z0-9]/.test(value) },
  { key: 'length', label: '8 characters', test: (value) => value.length >= 8 }
]

const sha1 = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
};

const isPasswordPwned = async (password) => {
  const hash = await sha1(password);

  const prefix = hash.slice(0, 5);
  const suffix = hash.slice(5);

  const res = await fetch(
    `https://api.pwnedpasswords.com/range/${prefix}`
  );

  const data = await res.text();

  const lines = data.split('\n');

  return lines.some(line => line.startsWith(suffix));
};

function PasswordCreation({ email, password, onBack, onPasswordCreated, isLoading }) {
  const [value, setValue] = useState(password || '')
  const [showPassword, setShowPassword] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [checkingPwned, setCheckingPwned] = useState(false)
  const [pwnedErrorLocal, setPwnedErrorLocal] = useState('')

  const results = requirements.map((requirement) => ({
    ...requirement,
    valid: requirement.test(value)
  }))

  const strengthCount = results.filter((item) => item.valid).length
  const strengthPercentage = (strengthCount / requirements.length) * 100
  
  const getStrengthColor = () => {
    if (strengthCount <= 1) return 'weak'
    if (strengthCount <= 2) return 'fair'
    if (strengthCount <= 3) return 'good'
    return 'strong'
  }

  const isPasswordValid = results.every((item) => item.valid)

  const handleChange = (event) => {
    setValue(event.target.value)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitted(true)
    
    if (!isPasswordValid) return

    setCheckingPwned(true)
    setPwnedErrorLocal('')

    try {
      const isPwned = await isPasswordPwned(value)

      if (isPwned) {
        setPwnedErrorLocal('This password has been compromised in a data breach. Please choose a different password.')
        return
      }

      await onPasswordCreated?.(value)
    } catch (error) {
      console.error('Error checking password:', error)
      setPwnedErrorLocal('Could not verify password security. Please try again.')
    } finally {
      setCheckingPwned(false)
    }
  }

  return (
    <div className="password-creation">
      <div className="password-creation__header">
        <h2 className="password-creation__title">Welcome to Insure Tech Guard</h2>
        <p className="password-creation__subtitle">Create a password</p>
      </div>

      <form className="password-creation__form" onSubmit={handleSubmit} noValidate>
        {/* Hidden email field for accessibility and password manager support */}
        <input
          type="email"
          value={email || ''}
          readOnly
          style={{ display: 'none' }}
          autoComplete="username"
          aria-hidden="true"
        />

        <div className="password-creation__field">
          <label className="password-creation__label" htmlFor="signup-password">
            Password
          </label>
          <div className="password-creation__input-wrap">
            <input
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              className="password-creation__input"
              placeholder="Enter a strong password"
              value={value}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="password-creation__toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
            </button>
          </div>
        </div>

        {pwnedErrorLocal && (
          <span className="password-creation__error" role="alert">
            {pwnedErrorLocal}
          </span>
        )}

        <div className="password-creation__strength" aria-live="polite">
          <div className="password-creation__strength-bars">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className={`password-creation__strength-bar ${index < strengthCount ? `password-creation__strength-bar--${getStrengthColor()}` : ''}`}
              />
            ))}
          </div>
        </div>

        <div className="password-creation__requirements" aria-live="polite">
          <p className="password-creation__requirements-title">Password must contain at least:</p>
          <ul className="password-creation__requirements-list">
            {results.map((item) => (
              <li
                key={item.key}
                className={`password-creation__requirement ${item.valid ? 'password-creation__requirement--valid' : ''}`}
              >
                <span className="password-creation__requirement-icon" aria-hidden="true">
                  {item.valid ? '✓' : '✕'}
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="password-creation__actions">
          <button type="button" className="password-creation__secondary" onClick={onBack} disabled={isLoading || checkingPwned}>
            Back
          </button>
          <button type="submit" className="password-creation__submit" disabled={isLoading || !isPasswordValid || checkingPwned}>
            {checkingPwned ? 'Checking password…' : isLoading ? 'Next…' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PasswordCreation

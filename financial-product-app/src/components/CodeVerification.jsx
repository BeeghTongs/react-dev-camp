import { useState, useRef } from 'react'
import './css/CodeVerification.css'
import { verifyCode, sendVerificationCode } from '../services/emailService.js'
import { trackEvent } from '../services/analyticsService.js'

function CodeVerification({ email, onBack, onVerified, onResend, isLoading }) {
  const [codeDigits, setCodeDigits] = useState(Array(6).fill(''))
  const [verificationError, setVerificationError] = useState('')
  const codeInputsRef = useRef([])

  const handleDigitChange = (index) => (event) => {
    const value = event.target.value.replace(/[^0-9]/g, '').slice(0, 1)
    setCodeDigits((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
    if (verificationError) setVerificationError('')

    if (value) {
      const nextInput = codeInputsRef.current[index + 1]
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index) => (event) => {
    if (event.key === 'Backspace' && !codeDigits[index] && index > 0) {
      const previousInput = codeInputsRef.current[index - 1]
      if (previousInput) previousInput.focus()
    }
  }

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/[^0-9]/g, '')
    if (!pasted) return

    event.preventDefault()
    const nextDigits = Array(6).fill('')
    pasted.split('').slice(0, 6).forEach((digit, index) => {
      nextDigits[index] = digit
    })
    setCodeDigits(nextDigits)

    const nextIndex = Math.min(pasted.length, 5)
    const nextInput = codeInputsRef.current[nextIndex]
    if (nextInput) nextInput.focus()
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    const code = codeDigits.join('');

    trackEvent('sign_up_otp_attempt')

    if (code.length < 6) {
      setVerificationError('Enter the 6-digit code sent to your email.');

      trackEvent('sign_up_otp_failed', { reason: 'short_code' })

      return;
    }

   const isValid = verifyCode(code, email);

    if (!isValid) {
      setVerificationError('Invalid or expired verification code. Please request a new code.');
      trackEvent('sign_up_otp_failed', { reason: 'invalid_code' })
      return;
    }

     trackEvent('sign_up_otp_verified')

    onVerified?.(code);
  };

  

const handleResend = async () => {
  setCodeDigits(Array(6).fill(''));
  setVerificationError('');

   trackEvent('sign_up_otp_resend')

  try {
    trackEvent('sign_up_otp_resend')

    await sendVerificationCode(email);

  } catch (err) {
    setVerificationError('Failed to resend code. Try again.');

    trackEvent('sign_up_error', {
        step: 'otp_resend',
        message: err.message
      })
  }

  onResend?.();
};

  return (
    <div className="code-verification">
      <div className="code-verification__header">
        <h2>Enter verification code</h2>
        <p className="code-verification__description">
          We have sent a temporary login code to{' '}
          <strong className="code-verification__email">{email}</strong>.
        </p>
        <button type="button" className="code-verification__link" onClick={onBack}>
          Not you?
        </button>
      </div>

      <form className="code-verification__form" onSubmit={handleSubmit} noValidate>
        <div className="code-verification__code-grid" onPaste={handlePaste}>
          {codeDigits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (codeInputsRef.current[index] = el)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={handleDigitChange(index)}
              onKeyDown={handleKeyDown(index)}
              className="code-verification__code-input"
              disabled={isLoading}
            />
          ))}
        </div>

        {verificationError && (
          <span className="code-verification__error" role="alert">
            {verificationError}
          </span>
        )}

        <p className="code-verification__hint">
          Haven’t received your code?{' '}
          <button type="button" className="code-verification__send-again-btn" onClick={handleResend}>
            Send again
          </button>
        </p>

        <button type="submit" className="code-verification__submit" disabled={isLoading}>
          {isLoading ? 'Verifying…' : 'Verify code'}
        </button>
      </form>
    </div>
  )
}

export default CodeVerification

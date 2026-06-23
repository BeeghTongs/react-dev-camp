import { useState } from 'react'
import { FcGoogle } from 'react-icons/fc'
import CodeVerification from './CodeVerification.jsx'
import PasswordCreation from './PasswordCreation.jsx'
import PersonalDetailsInput from './PersonalDetailsInput.jsx'
import { sendVerificationCode } from '../services/emailService.js'
import './css/SignUpForm.css'

function SignUpForm({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    surname: '',
    idNumber: ''
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState('email')

  const validate = () => {
    const next = {}
    if (!formData.email.trim()) {
      next.email = 'Email is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      next.email = 'Enter a valid email address.'
    }
    return next
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

      setIsLoading(true)

  try {
    await sendVerificationCode(formData.email) 

    setStep('code')
  } catch (err) {
    console.error('Failed to send OTP:', err)
    setErrors({ email: 'Failed to send verification code. Try again.' })
  } finally {
    setIsLoading(false)
  }
  }

  const handleVerification = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setIsLoading(false)
    setStep('details')
  }

  const handlePasswordCreated = async (password) => {
    setFormData((prev) => ({ ...prev, password }))
    window.alert(`Registered ${formData.firstName} ${formData.surname}`)
  }

  const handlePersonalDetailsSubmit = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setIsLoading(false)
    setStep('password')
  }

  return (
    <div className="signup-form">
      {step === 'email' ? (
        <div className="signup-card__brand-wrap">
          <h1 className="signup-card__title">Create your account</h1>
          <p className="signup-card__subtitle">Create a profile, browse and subscribe to our range of products.</p>
        </div>
      ) : null}

      {step === 'email' ? (
        <>
          <button type="button" className="signup-form__google-btn">
            <FcGoogle size={20} />
            Continue with Google
          </button>

          <div className="signup-form__divider">
            <span>or</span>
          </div>
        </>
      ) : null}

      {step === 'email' ? (
        <form className="signup-form__body" onSubmit={handleSubmit} noValidate>
          <div className={`signup-form__field ${errors.email ? 'signup-form__field--error' : ''}`}>
            <label className="signup-form__label" htmlFor="signup-email">
              Enter email address
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              className="signup-form__input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <span className="signup-form__error" role="alert">
                {errors.email}
              </span>
            )}
          </div>

          <button type="submit" className="signup-form__submit" disabled={isLoading}>
            {isLoading ? 'Next…' : 'Next'}
          </button>
        </form>
      ) : step === 'code' ? (
        <CodeVerification
          email={formData.email}
          onBack={() => setStep('email')}
          onVerified={handleVerification}
          onResend={() => {
            /* noop for mocked resend */
          }}
          isLoading={isLoading}
        />
      ) : step === 'details' ? (
        <PersonalDetailsInput
          formData={formData}
          onChange={handleChange}
          onBack={() => setStep('code')}
          onSubmit={handlePersonalDetailsSubmit}
          isLoading={isLoading}
        />
      ) : (
        <PasswordCreation
          password={formData.password}
          onBack={() => setStep('details')}
          onPasswordCreated={handlePasswordCreated}
          isLoading={isLoading}
        />
      )}

      {step === 'email' ? (
        <p className="signup-card__meta">
          Already have an account?{' '}
          <button
            type="button"
            className="signup-form__log-in-btn"
            onClick={onSwitchToLogin}
          >
            Log in
          </button>
        </p>
      ) : null}
    </div>
  )
}

export default SignUpForm

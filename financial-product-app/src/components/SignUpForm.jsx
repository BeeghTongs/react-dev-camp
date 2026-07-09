import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import CodeVerification from './CodeVerification.jsx'
import PasswordCreation from './PasswordCreation.jsx'
import PersonalDetailsInput from './PersonalDetailsInput.jsx'
import { sendVerificationCode } from '../services/emailService.js'
import { completeSignup } from '../services/signupService.js'
import { trackEvent } from '../services/analyticsService.js'
import './css/SignUpForm.css'

const SIGNUP_SESSION_KEY = 'signup_progress'

function SignUpForm({ onSwitchToLogin }) {
  const navigate = useNavigate()

  const [formData, setFormData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SIGNUP_SESSION_KEY)
      if (saved) return { ...JSON.parse(saved).formData, password: '' }
    } catch {}
    return { email: '', password: '', firstName: '', surname: '', idNumber: '' }
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SIGNUP_SESSION_KEY)
      if (saved) return JSON.parse(saved).step ?? 'email'
    } catch {}
    return 'email'
  })

  useEffect(() => {
    const { password: _omit, ...persistable } = formData
    sessionStorage.setItem(SIGNUP_SESSION_KEY, JSON.stringify({ step, formData: persistable }))
  }, [step, formData])

  useEffect(() => {
    trackEvent('sign_up_start')
  }, [])

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
    trackEvent('sign_up_email_submitted', {
      hasEmail: true
    })
    await sendVerificationCode(formData.email) 

       trackEvent('sign_up_otp_sent', {
      email: formData.email
    })

    setStep('code')
  } catch (err) {
      trackEvent('sign_up_error', {
        step: 'email',
        message: err.message
      })

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
    setIsLoading(true)
    setErrors({})

    try {
      const signupResult = await completeSignup({
        email: formData.email,
        password,
        firstName: formData.firstName,
        lastName: formData.surname,
        idNumber: formData.idNumber,
        customerTypeId: 0,
      })

      localStorage.setItem('jwt', signupResult.token)

      sessionStorage.removeItem(SIGNUP_SESSION_KEY)
      sessionStorage.setItem('signup_awaiting_customer_type', '1')
      navigate('/customer-type', { replace: true })
    } catch (error) {

      trackEvent('sign_up_error', {
        step: 'final_signup',
        message: error.message
      })

      const message = error.message || 'Failed to complete signup. Please try again.'
      setErrors({ signup: message })

      await new Promise((resolve) => setTimeout(resolve, 800))
      sessionStorage.removeItem(SIGNUP_SESSION_KEY)
      onSwitchToLogin?.()
    } finally {
      setIsLoading(false)
    }
  }

  const handlePersonalDetailsSubmit = async () => {
    setIsLoading(true)

    trackEvent('sign_up_personal_details_complete', {
      hasIdNumber: !!formData.idNumber
    })

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
        <>
          {errors.signup && (
            <span className="signup-form__error" role="alert">
              {errors.signup}
            </span>
          )}
          <PasswordCreation
            email={formData.email}
            password={formData.password}
            onBack={() => setStep('details')}
            onPasswordCreated={handlePasswordCreated}
            isLoading={isLoading}
          />
        </>
      )}

      {step === 'email' ? (
        <p className="signup-card__meta">
          Already have an account?{' '}
          <button
            type="button"
            className="signup-form__log-in-btn"
            onClick={() => { sessionStorage.removeItem(SIGNUP_SESSION_KEY); onSwitchToLogin?.() }}
          >
            Log in
          </button>
        </p>
      ) : null}
    </div>
  )
}

export default SignUpForm

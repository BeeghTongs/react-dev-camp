import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdCheckCircle } from 'react-icons/md'
import { getCustomerTypes, getClientProfile, updateClientProfile } from '../services/signupService'
import './css/CustomerType.css'

function CustomerType() {
  const navigate = useNavigate()
  const [customerTypes, setCustomerTypes] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState(null)
  const [submitError, setSubmitError] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('jwt')
    getCustomerTypes(token)
      .then(setCustomerTypes)
      .catch((err) => setFetchError(err.message))
  }, [])

  const handleContinue = async () => {
    if (!selectedId) return
    setIsLoading(true)
    setSubmitError(null)
    try {
      const token = localStorage.getItem('jwt')
      const profile = await getClientProfile(token)
      await updateClientProfile(token, { ...profile, customerTypeId: selectedId })

      sessionStorage.removeItem('signup_awaiting_customer_type')
      navigate('/identity-verification')
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (fetchError) {
    return (
      <div className="customer-type">
        <p className="customer-type__error">Failed to load account types: {fetchError}</p>
      </div>
    )
  }

  return (
    <div className="customer-type">
      <div className="customer-type__header">
        <h1 className="customer-type__title">Account type</h1>
        <p className="customer-type__subtitle">
          Choose the account type that best describes how you'll be using the platform.
        </p>
      </div>

      <ul className="customer-type__list" role="listbox" aria-label="Customer type options">
        {customerTypes.map((type) => {
          const isSelected = selectedId === type.id
          return (
            <li key={type.id}>
              <button
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`customer-type__option${isSelected ? ' customer-type__option--selected' : ''}`}
                onClick={() => setSelectedId(type.id)}
              >
                <div className="customer-type__option-text">
                  <p className="customer-type__option-name">{type.name}</p>
                  <p className="customer-type__option-desc">{type.description}</p>
                </div>
                {isSelected && <MdCheckCircle className="customer-type__check" size={22} />}
              </button>
            </li>
          )
        })}
      </ul>

      {submitError && <p className="customer-type__error">{submitError}</p>}

      <button
        type="button"
        className="customer-type__submit"
        disabled={!selectedId || isLoading}
        onClick={handleContinue}
      >
        {isLoading ? 'Saving…' : 'Continue'}
      </button>
    </div>
  )
}

export default CustomerType

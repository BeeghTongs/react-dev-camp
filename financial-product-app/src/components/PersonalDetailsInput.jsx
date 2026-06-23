import { useState } from 'react'
import './css/SignUpForm.css'
import './css/PersonalDetailsInput.css'

const isValidSouthAfricanId = (id) => {
  if (!/^\d{13}$/.test(id)) return false;

  let sum = 0;

  // Double every second digit (even positions: 2nd, 4th, 6th, etc.)
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(id[i], 10);

    if ((i + 1) % 2 === 0) { // Even position (1-indexed)
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
  }

  const checkDigit = parseInt(id[12], 10);
  const calculated = (10 - (sum % 10)) % 10;

  return checkDigit === calculated;
};

function PersonalDetailsInput({ formData, onChange, onSubmit, isLoading }) {
  const [idError, setIdError] = useState('');

  const handleIdChange = (event) => {
    onChange(event);
    setIdError('');
  };

  const handleIdBlur = () => {
    const idValue = formData.idNumber;
    
    if (idValue?.trim() && !isValidSouthAfricanId(idValue)) {
      setIdError('Please enter a valid South African ID number');
    } else {
      setIdError('');
    }
  };

  const isButtonDisabled =
    isLoading ||
    !formData.firstName?.trim() ||
    !formData.surname?.trim() ||
    !formData.idNumber?.trim() ||
    !!idError

  return (
    <div className="signup-form__personal-details">
      <div className="signup-form__verification-header">
        <h2 className="personal-details__title">Welcome to Insure Tech Guard</h2>
        <p className="signup-form__description">
          Tell us about yourself
        </p>
      </div>

      <form
        className="signup-form__body"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
        noValidate
      >
        <div className="signup-form__field">
          <label className="signup-form__label" htmlFor="first-name">
            Name
          </label>
          <input
            id="first-name"
            name="firstName"
            type="text"
            className="signup-form__input"
            placeholder="John"
            value={formData.firstName || ''}
            onChange={onChange}
            disabled={isLoading}
            autoComplete="given-name"
          />
        </div>

        <div className="signup-form__field">
          <label className="signup-form__label" htmlFor="surname">
            Surname
          </label>
          <input
            id="surname"
            name="surname"
            type="text"
            className="signup-form__input"
            placeholder="Doe"
            value={formData.surname || ''}
            onChange={onChange}
            disabled={isLoading}
            autoComplete="family-name"
          />
        </div>

        <div className="signup-form__field">
          <label className="signup-form__label" htmlFor="id-number">
            ID number
          </label>
          <input
            id="id-number"
            name="idNumber"
            type="text"
            className="signup-form__input"
            placeholder="8803225129085"
            value={formData.idNumber || ''}
            onChange={handleIdChange}
            onBlur={handleIdBlur}
            disabled={isLoading}
            autoComplete="off"
          />
          {idError && (
            <span className="signup-form__error" role="alert">
              {idError}
            </span>
          )}
        </div>

        <div className="signup-form__button-row">
          <button type="submit" className="signup-form__submit" disabled={isButtonDisabled}>
            {isLoading ? 'Saving…' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default PersonalDetailsInput

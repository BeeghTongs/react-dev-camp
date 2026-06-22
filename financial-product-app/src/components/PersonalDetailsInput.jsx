import './css/SignUpForm.css'
import './css/PersonalDetailsInput.css'

function PersonalDetailsInput({ formData, onChange, onSubmit, isLoading }) {
  const isButtonDisabled =
    isLoading ||
    !formData.firstName?.trim() ||
    !formData.surname?.trim() ||
    !formData.idNumber?.trim()

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
            onChange={onChange}
            disabled={isLoading}
            autoComplete="off"
          />
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

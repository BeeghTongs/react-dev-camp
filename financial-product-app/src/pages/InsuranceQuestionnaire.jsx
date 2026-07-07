import './css/InsuranceQuestionnaire.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getProfileId } from '../services/authService';

const CATEGORIES = [
  {
    id: 'retail-short-term',
    label: 'Retail Short-Term',
    description: 'Covers personal assets — car, home, gadgets, valuables.',
  },
  {
    id: 'retail-long-term',
    label: 'Retail Long-Term',
    description: 'Covers life, disability, funeral, income protection.',
  },
  {
    id: 'commercial-short-term',
    label: 'Commercial Short-Term',
    description: 'Covers business assets, liability, vehicles, property.',
  },
  {
    id: 'commercial-long-term',
    label: 'Commercial Long-Term',
    description: 'Covers key person, group life, employee benefits.',
  },
];

const RETAIL_SHORT_TERM_SUBTYPES = [
  { id: 'vehicle', label: 'Vehicle insurance', description: 'Cover for your car or other vehicles.' },
  { id: 'home', label: 'Home contents', description: 'Cover for the contents of your home.' },
  { id: 'gadgets', label: 'Gadgets / portable possessions', description: 'Cover for phones, laptops and other valuables.' },
];

const FIELDS = {
  'retail-short-term': {
    vehicle: [
      { id: 'make', label: 'Make', type: 'text' },
      { id: 'model', label: 'Model', type: 'text' },
      { id: 'year', label: 'Year', type: 'number' },
      { id: 'registrationNumber', label: 'Registration number', type: 'text' },
      { id: 'driverAge', label: 'Primary driver age', type: 'number' },
      { id: 'licenceType', label: 'Primary driver licence type', type: 'select', options: ["Code 8", "Code 10", "Code 14", "Learner's"] },
      { id: 'overnightParking', label: 'Where is the vehicle parked overnight?', type: 'select', options: ['Garage', 'Open', 'Complex / secure parking'] },
      { id: 'previousClaims', label: 'Any previous claims in the last 3 years?', type: 'yesno' },
      { id: 'financed', label: 'Is the vehicle financed?', type: 'yesno' },
      { id: 'modifications', label: 'Any modifications?', type: 'yesno' },
    ],
    home: [
      { id: 'dwellingType', label: 'Type of dwelling', type: 'select', options: ['House', 'Flat', 'Townhouse'] },
      { id: 'securityFeatures', label: 'Security features', type: 'select', options: ['Alarm', 'Electric fence', 'Guards', 'None'] },
      { id: 'suburb', label: 'Area / suburb', type: 'text' },
      { id: 'contentsValue', label: 'Estimated contents value (R)', type: 'number' },
      { id: 'previousBurglaryClaims', label: 'Any previous burglary claims?', type: 'yesno' },
    ],
    gadgets: [
      { id: 'deviceType', label: 'Device type', type: 'text' },
      { id: 'makeModel', label: 'Make and model', type: 'text' },
      { id: 'purchaseDate', label: 'Purchase date', type: 'date' },
      { id: 'value', label: 'Value (R)', type: 'number' },
      { id: 'coveredUnderHomeContents', label: 'Is it covered under home contents already?', type: 'yesno' },
    ],
  },
  'retail-long-term': [
    { id: 'age', label: 'Age', type: 'number' },
    { id: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
    { id: 'smoker', label: 'Smoker?', type: 'yesno' },
    { id: 'medicalHistory', label: 'Medical history (chronic conditions, hospitalisations)', type: 'textarea' },
    { id: 'height', label: 'Height (cm)', type: 'number' },
    { id: 'weight', label: 'Weight (kg)', type: 'number' },
    { id: 'occupation', label: 'Occupation', type: 'text' },
    { id: 'income', label: 'Monthly income (R)', type: 'number' },
    { id: 'dangerousHobbies', label: 'Dangerous hobbies (e.g. skydiving, motorsport)?', type: 'yesno' },
    { id: 'existingLifeCover', label: 'Existing life cover elsewhere?', type: 'yesno' },
    { id: 'sumAssured', label: 'Sum assured required (R)', type: 'number' },
  ],
  'commercial-short-term': [
    { id: 'industry', label: 'Nature of business / industry', type: 'text' },
    { id: 'annualTurnover', label: 'Annual turnover (R)', type: 'number' },
    { id: 'employeeCount', label: 'Number of employees', type: 'number' },
    { id: 'premisesOwnership', label: 'Business premises', type: 'select', options: ['Owned', 'Leased'] },
    { id: 'premisesSecurity', label: 'Security at premises', type: 'text' },
    { id: 'fleetVehicles', label: 'Fleet — number of vehicles', type: 'number' },
    { id: 'fleetDrivers', label: 'Fleet — number of drivers', type: 'number' },
    { id: 'pendingLitigation', label: 'Any pending litigation?', type: 'yesno' },
    { id: 'claimsHistory', label: 'Previous claims history (last 3–5 years)', type: 'textarea' },
    { id: 'publicLiabilityLimit', label: 'Public liability limit required (R)', type: 'number' },
  ],
  'commercial-long-term': [
    { id: 'employeesCovered', label: 'Number of employees to be covered', type: 'number' },
    { id: 'averageAge', label: 'Average age of workforce', type: 'number' },
    { id: 'industry', label: 'Industry / occupation type', type: 'text' },
    { id: 'existingGroupScheme', label: 'Existing group schemes in place?', type: 'yesno' },
    { id: 'keyPersonRole', label: 'Key person — role', type: 'text' },
    { id: 'keyPersonSalary', label: 'Key person — salary (R)', type: 'number' },
    { id: 'keyPersonCriticality', label: 'Key person — how critical are they to the business?', type: 'textarea' },
    { id: 'benefitStructure', label: 'Benefit structure', type: 'select', options: ['Flat amount', 'Salary multiple'] },
  ],
};

const COMMON_FIELDS = [
  { id: 'fullName', label: 'Full name / business name', type: 'text' },
  { id: 'contactNumber', label: 'Contact number', type: 'text' },
  { id: 'existingCoverElsewhere', label: 'Existing cover with other insurers?', type: 'yesno' },
  { id: 'claimsDeclinedOrCancelled', label: 'Any claims declined or policies cancelled by another insurer?', type: 'yesno' },
];

function getCategoryFields(categoryId, subtypeId) {
  const fields = FIELDS[categoryId];
  if (!fields) return [];
  return categoryId === 'retail-short-term' ? fields[subtypeId] ?? [] : fields;
}

function Field({ field, value, onChange }) {
  if (field.type === 'yesno') {
    return (
      <div className="insurance-card__field">
        <span className="insurance-card__field-label">{field.label}</span>
        <div className="insurance-card__yesno">
          {['Yes', 'No'].map((option) => (
            <button
              key={option}
              type="button"
              className={`insurance-card__yesno-btn${value === option ? ' insurance-card__yesno-btn--selected' : ''}`}
              onClick={() => onChange(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div className="insurance-card__field">
        <label className="insurance-card__field-label" htmlFor={field.id}>{field.label}</label>
        <select
          id={field.id}
          className="insurance-card__input"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="" disabled>Select an option</option>
          {field.options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === 'textarea') {
    return (
      <div className="insurance-card__field">
        <label className="insurance-card__field-label" htmlFor={field.id}>{field.label}</label>
        <textarea
          id={field.id}
          className="insurance-card__textarea"
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
        />
      </div>
    );
  }

  return (
    <div className="insurance-card__field">
      <label className="insurance-card__field-label" htmlFor={field.id}>{field.label}</label>
      <input
        id={field.id}
        type={field.type}
        className="insurance-card__input"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default function InsuranceQuestionnaire() {
  const navigate = useNavigate();
  const location = useLocation();

  // The category (and, for retail short-term, the subtype) is decided by
  // wherever the user enquired from — the insurance list pages pass it via
  // navigation state — so this page never asks for it again.
  const category = location.state?.category ?? null;
  const initialSubtype = location.state?.subtype ?? null;
  const needsSubtype = category === 'retail-short-term' && !initialSubtype;

  const [stage, setStage] = useState(needsSubtype ? 'subtype' : 'details'); // 'intro' | 'subtype' | 'details' | 'common' | 'results'
  const [subtype, setSubtype] = useState(initialSubtype);
  const [categoryAnswers, setCategoryAnswers] = useState({});
  const [commonAnswers, setCommonAnswers] = useState({});
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!category) navigate('/list', { replace: true });
  }, [category, navigate]);

  if (!category) return null;

  const categoryFields = getCategoryFields(category, subtype);
  const stageOrder = needsSubtype ? ['subtype', 'details', 'common'] : ['details', 'common'];
  const stageIndex = stageOrder.indexOf(stage);
  const showProgress = stageIndex !== -1;

  function updateCategoryAnswer(id, value) {
    setCategoryAnswers((current) => ({ ...current, [id]: value }));
  }

  function updateCommonAnswer(id, value) {
    setCommonAnswers((current) => ({ ...current, [id]: value }));
  }

  function handleSelectSubtype(id) {
    setSubtype(id);
    setStage('details');
  }

  function handleDetailsSubmit(event) {
    event.preventDefault();
    setStage('common');
  }

  async function handleCommonSubmit(event) {
    event.preventDefault();
    if (!consent || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const customerId = await getProfileId();
      await addDoc(collection(db, 'quotes'), {
        customerId,
        category,
        categoryLabel: selectedCategory?.label ?? category,
        subtype,
        subtypeLabel: selectedSubtype?.label ?? null,
        categoryAnswers,
        commonAnswers,
        status: 'Pending',
        submittedAt: serverTimestamp(),
      });
      setStage('results');
    } catch (error) {
      console.error('Failed to submit insurance quote:', error);
      setSubmitError('Something went wrong submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleBack() {
    if (stage === 'subtype') {
      navigate(-1);
      return;
    }
    if (stage === 'details') {
      if (needsSubtype) setStage('subtype');
      else navigate(-1);
      return;
    }
    if (stage === 'common') {
      setStage('details');
      return;
    }
    setStage('common');
  }

  const selectedCategory = CATEGORIES.find((c) => c.id === category);
  const selectedSubtype = RETAIL_SHORT_TERM_SUBTYPES.find((s) => s.id === subtype);

  return (
    <div className="insurance-page">
      <div className="insurance-card">
        <button type="button" className="insurance-card__back" onClick={handleBack} aria-label="Back">
          <MdArrowBack />
        </button>

        {stage === 'subtype' && (
          <div className="insurance-card__question">
            <h2 className="insurance-card__question-title">What would you like to cover?</h2>
            <div className="insurance-card__options">
              {RETAIL_SHORT_TERM_SUBTYPES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`insurance-card__option${subtype === option.id ? ' insurance-card__option--selected' : ''}`}
                  onClick={() => handleSelectSubtype(option.id)}
                >
                  <span className="insurance-card__option-label">{option.label}</span>
                  <span className="insurance-card__option-desc">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {stage === 'details' && (
          <form className="insurance-card__form" onSubmit={handleDetailsSubmit}>
            <h2 className="insurance-card__question-title">
              {selectedSubtype ? selectedSubtype.label : selectedCategory?.label} details
            </h2>
            <div className="insurance-card__fields">
              {categoryFields.map((field) => (
                <Field
                  key={field.id}
                  field={field}
                  value={categoryAnswers[field.id]}
                  onChange={(value) => updateCategoryAnswer(field.id, value)}
                />
              ))}
            </div>
            <button type="submit" className="insurance-card__cta">Continue</button>
          </form>
        )}

        {stage === 'common' && (
          <form className="insurance-card__form" onSubmit={handleCommonSubmit}>
            <h2 className="insurance-card__question-title">A few last details</h2>
            <div className="insurance-card__fields">
              {COMMON_FIELDS.map((field) => (
                <Field
                  key={field.id}
                  field={field}
                  value={commonAnswers[field.id]}
                  onChange={(value) => updateCommonAnswer(field.id, value)}
                />
              ))}
              <label className="insurance-card__consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(event) => setConsent(event.target.checked)}
                />
                I consent to credit and fraud checks being performed as part of this application.
              </label>
              {submitError && <p className="insurance-card__error">{submitError}</p>}
            </div>
            <button type="submit" className="insurance-card__cta" disabled={!consent || isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        )}

        {stage === 'results' && (
          <div className="insurance-card__results">
            <span className="insurance-card__results-badge">Application received</span>
            <h2 className="insurance-card__results-title">
              Thanks — we've got your {selectedSubtype ? selectedSubtype.label.toLowerCase() : selectedCategory?.label.toLowerCase()} details
            </h2>
            <p className="insurance-card__results-desc">
              We'll review what you've shared and be in touch with a quote shortly.
            </p>
            <button type="button" className="insurance-card__cta" onClick={() => navigate('/list')}>
              Done
            </button>
          </div>
        )}

        {showProgress && (
          <div className="insurance-card__progress">
            <span className="insurance-card__progress-label">Step {stageIndex + 1} of {stageOrder.length}</span>
            <div className="insurance-card__progress-track">
              <div
                className="insurance-card__progress-fill"
                style={{ width: `${((stageIndex + 1) / stageOrder.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

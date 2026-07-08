import './css/FICAPage.css';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { getProfileId } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';

const SOURCE_OF_FUNDS_OPTIONS = ['Salary', 'Inheritance', 'Business income', 'Savings', 'Property sale'];

// Mocked verification delay before the FICA check "clears" and the
// investment quote is submitted — stands in for a real AML/compliance check.
const VERIFICATION_DELAY_MS = 3000;

export default function FICAPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // The investment product being applied for is decided by wherever the
  // user enquired from — the investment list pages pass it via navigation
  // state — so this page never asks for it again.
  const investmentId = location.state?.investmentId ?? null;
  const investmentName = location.state?.investmentName ?? null;
  const investmentType = location.state?.investmentType ?? null;
  const price = location.state?.price ?? null;

  const [stage, setStage] = useState('details'); // 'details' | 'verifying' | 'results'
  const [taxReferenceNumber, setTaxReferenceNumber] = useState('');
  const [taxResident, setTaxResident] = useState(null);
  const [sourceOfFunds, setSourceOfFunds] = useState('');
  const [pep, setPep] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!investmentName) navigate('/list', { replace: true });
  }, [investmentName, navigate]);

  if (!investmentName) return null;

  const isComplete = Boolean(taxReferenceNumber.trim() && taxResident && sourceOfFunds && pep);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!isComplete || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    const ficaAnswers = { taxReferenceNumber: taxReferenceNumber.trim(), taxResident, sourceOfFunds, pep };

    try {
      const customerId = await getProfileId();
      await addDoc(collection(db, 'fica'), {
        customerId,
        ...ficaAnswers,
        submittedAt: serverTimestamp(),
      });

      setStage('verifying');

      window.setTimeout(async () => {
        try {
          await addDoc(collection(db, 'quotes'), {
            customerId,
            category: 'investment',
            categoryLabel: investmentName,
            subtypeLabel: investmentType,
            investmentId,
            price,
            ficaAnswers,
            status: 'Pending',
            submittedAt: serverTimestamp(),
          });
        } catch (error) {
          console.error('Failed to submit investment quote:', error);
        } finally {
          setStage('results');
        }
      }, VERIFICATION_DELAY_MS);
    } catch (error) {
      console.error('Failed to submit FICA details:', error);
      setSubmitError('Something went wrong submitting your details. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fica-page">
      <div className="fica-card">
        {stage === 'details' && (
          <button type="button" className="fica-card__back" onClick={() => navigate(-1)} aria-label="Back">
            <MdArrowBack />
          </button>
        )}

        {stage === 'details' && (
          <form className="fica-card__form" onSubmit={handleSubmit}>
            <h1 className="fica-card__title">FICA verification</h1>
            <p className="fica-card__subtitle">
              We're required to verify a few details before we can process your {investmentName.toLowerCase()} application.
            </p>

            <div className="fica-card__fields">
              <div className="fica-card__field">
                <label className="fica-card__field-label" htmlFor="taxReferenceNumber">Tax reference number</label>
                <input
                  id="taxReferenceNumber"
                  type="text"
                  className="fica-card__input"
                  value={taxReferenceNumber}
                  onChange={(event) => setTaxReferenceNumber(event.target.value)}
                />
              </div>

              <div className="fica-card__field">
                <span className="fica-card__field-label">Are you a South African tax resident?</span>
                <div className="fica-card__yesno">
                  {['Yes', 'No'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`fica-card__yesno-btn${taxResident === option ? ' fica-card__yesno-btn--selected' : ''}`}
                      onClick={() => setTaxResident(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="fica-card__field">
                <label className="fica-card__field-label" htmlFor="sourceOfFunds">Source of funds</label>
                <select
                  id="sourceOfFunds"
                  className="fica-card__input"
                  value={sourceOfFunds}
                  onChange={(event) => setSourceOfFunds(event.target.value)}
                >
                  <option value="" disabled>Select an option</option>
                  {SOURCE_OF_FUNDS_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="fica-card__field">
                <span className="fica-card__field-label">Are you, or a family member, a politically exposed person?</span>
                <div className="fica-card__yesno">
                  {['Yes', 'No'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={`fica-card__yesno-btn${pep === option ? ' fica-card__yesno-btn--selected' : ''}`}
                      onClick={() => setPep(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {submitError && <p className="fica-card__error">{submitError}</p>}
            </div>

            <button type="submit" className="fica-card__cta" disabled={!isComplete || isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </button>
          </form>
        )}

        {stage === 'verifying' && (
          <div className="fica-card__verifying">
            <LoadingSpinner label="Verifying your FICA details…" />
          </div>
        )}

        {stage === 'results' && (
          <div className="fica-card__results">
            <span className="fica-card__results-badge">Verification complete</span>
            <h2 className="fica-card__results-title">You're all set</h2>
            <p className="fica-card__results-desc">
              Your FICA details are verified and we've submitted your {investmentName.toLowerCase()} quote for review.
            </p>
            <button type="button" className="fica-card__cta" onClick={() => navigate('/quotes', { replace: true })}>
              View my quotes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

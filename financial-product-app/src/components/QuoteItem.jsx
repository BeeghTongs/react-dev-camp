import './css/QuoteItem.css';
import { useNavigate } from 'react-router-dom';
import { MdCheckCircle, MdDownload, MdHourglassEmpty } from 'react-icons/md';

function QuoteItem({ id, category, categoryLabel, subtypeLabel, productName, price, submittedAt, status, paid, contractUrl }) {
  const navigate = useNavigate();

  const formattedDate = submittedAt?.toDate
    ? submittedAt.toDate().toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const isPending = (status ?? 'Pending') === 'Pending';
  const isApproved = status === 'Approved';
  const isInvestment = category === 'investment';
  // productName is the specific product (e.g. "Jewellery Cover"); older
  // quotes and the broad category fall back to categoryLabel.
  const title = productName ?? categoryLabel;

  return (
    <div className="quote-item">
      <div className="quote-item__info">
        <p className="quote-item__name">{title}</p>
        {subtypeLabel && <p className="quote-item__meta">{subtypeLabel}</p>}
        {price != null && (
          <p className="quote-item__meta">{isInvestment ? `R${price} initial investment` : `R${price} / month`}</p>
        )}
        <p className="quote-item__meta">Submitted {formattedDate}</p>
      </div>
      <div className="quote-item__status">
        {isPending ? (
          <span className="quote-item__pending">
            <MdHourglassEmpty /> Pending
          </span>
        ) : (
          <span className="quote-item__complete">
            <MdCheckCircle /> {status}
          </span>
        )}

        {isApproved && (
          paid ? (
            <>
              <span className="quote-item__paid">
                <MdCheckCircle /> Paid
              </span>
              {contractUrl && (
                <a
                  className="quote-item__contract-link"
                  href={contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MdDownload /> {isInvestment ? 'Certificate' : 'Policy'}
                </a>
              )}
            </>
          ) : (
            <button
              type="button"
              className="quote-item__pay-btn"
              onClick={() => navigate('/quote-payment', {
                state: { quoteId: id, title, subtypeLabel, price, category },
              })}
            >
              Pay now
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default QuoteItem;

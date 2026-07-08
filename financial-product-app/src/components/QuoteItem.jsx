import './css/QuoteItem.css';
import { MdCheckCircle, MdHourglassEmpty } from 'react-icons/md';

function QuoteItem({ category, categoryLabel, subtypeLabel, productName, price, submittedAt, status }) {
  const formattedDate = submittedAt?.toDate
    ? submittedAt.toDate().toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const isPending = (status ?? 'Pending') === 'Pending';
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
      {isPending ? (
        <span className="quote-item__pending">
          <MdHourglassEmpty /> Pending
        </span>
      ) : (
        <span className="quote-item__complete">
          <MdCheckCircle /> {status}
        </span>
      )}
    </div>
  );
}

export default QuoteItem;

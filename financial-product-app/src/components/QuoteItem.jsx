import './css/QuoteItem.css';
import { MdCheckCircle, MdHourglassEmpty } from 'react-icons/md';

function QuoteItem({ categoryLabel, subtypeLabel, submittedAt, status }) {
  const formattedDate = submittedAt?.toDate
    ? submittedAt.toDate().toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const isPending = (status ?? 'Pending') === 'Pending';

  return (
    <div className="quote-item">
      <div className="quote-item__info">
        <p className="quote-item__name">{categoryLabel}</p>
        {subtypeLabel && <p className="quote-item__meta">{subtypeLabel}</p>}
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

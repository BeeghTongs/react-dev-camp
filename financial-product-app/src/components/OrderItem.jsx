import './css/OrderItem.css';
import { MdDownload, MdHourglassEmpty } from 'react-icons/md';

function OrderItem({ id, deviceName, colour, providerName, planName, contractMonths, monthlyPrice, total, contractUrl }) {
  return (
    <div className="order-item">
      <div className="order-item__info">
        <p className="order-item__name">{deviceName}</p>
        <p className="order-item__meta">{colour} &middot; {providerName} &middot; {planName}</p>
        <p className="order-item__meta">{contractMonths}-month contract &middot; {id}</p>
      </div>
      <div className="order-item__price">
        <span className="order-item__total">R{monthlyPrice?.toFixed(2)}/mo</span>
      </div>
      {contractUrl ? (
        <a
          className="order-item__contract-btn"
          href={contractUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <MdDownload /> Contract
        </a>
      ) : (
        <span className="order-item__pending">
          <MdHourglassEmpty /> Pending
        </span>
      )}
    </div>
  );
}

export default OrderItem;

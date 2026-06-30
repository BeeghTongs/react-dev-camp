import './css/LoadingSpinner.css';

function LoadingSpinner({ label }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="spinner__dot" style={{ '--i': i }} />
        ))}
      </div>
      {label && <p className="spinner__label">{label}</p>}
    </div>
  );
}

export default LoadingSpinner;

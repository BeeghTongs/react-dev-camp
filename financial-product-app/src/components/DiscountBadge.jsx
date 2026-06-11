import './css/DiscountBadge.css';

function DiscountBadge({ percentage, className = '' }) {
	return (
		<div className={`discount-badge ${className}`.trim()}>
			<span>{percentage}%</span> 
            <span>OFF</span>
		</div>
	);
}

export default DiscountBadge;
import './css/SearchBar.css';
import { MdSearch } from 'react-icons/md';

function SearchBar({ value, onChange, onCancel, placeholder = 'Search' }) {
  function handleCancel() {
    onChange?.('');
    onCancel?.();
  }

  return (
    <div className="search-bar">
      <div className="search-bar__field">
        <MdSearch className="search-bar__icon" />
        <input
          type="text"
          className="search-bar__input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
        />
      </div>
      <button type="button" className="search-bar__cancel" onClick={handleCancel}>
        Cancel
      </button>
    </div>
  );
}

export default SearchBar;

const SearchBar = ({ value, onChange, placeholder = 'Search...', className = '' }) => (
  <div className={`search-bar ${className}`.trim()}>
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label="Search"
    />
  </div>
);

export default SearchBar;

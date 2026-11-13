const Loader = ({ text = 'Loading...' }) => (
  <div className="loader-wrap" role="status" aria-live="polite">
    <div className="loader" />
    <p>{text}</p>
  </div>
);

export default Loader;

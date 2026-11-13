const Input = ({ label, type = 'text', name, value, onChange, placeholder, required, ...props }) => (
  <label className="field">
    {label ? <span className="field__label">{label}</span> : null}
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="field__input"
      {...props}
    />
  </label>
);

export default Input;

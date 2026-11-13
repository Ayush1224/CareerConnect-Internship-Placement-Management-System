import { Link } from 'react-router-dom';

const Button = ({ children, variant = 'primary', size = 'md', className = '', to, ...props }) => {
  const classes = `btn btn--${variant} btn--${size} ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};

export default Button;

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';

const LoginForm = ({ onSubmit, isLoading, error }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: true });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <form className="auth-form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required autoComplete="email" />
      <div className="password-wrap">
        <Input label="Password" name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="••••••••" required autoComplete="current-password" />
        <button type="button" className="password-toggle" onClick={() => setShowPassword((prev) => !prev)}>
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <div className="form-row form-row--between">
        <label className="checkfield"><input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} /> Remember me</label>
        <Link to="/forgot-password" className="text-link">Forgot password?</Link>
      </div>
      <Button type="submit" className="w-100" disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;

import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const RegisterForm = ({ onSubmit, isLoading, error }) => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    accepted: false
  });

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <form className="auth-form" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      <div className="form-grid">
        <Input label="Full name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required autoComplete="name" />
        <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required autoComplete="email" />
        <Input label="Phone number" name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" autoComplete="tel" />
        <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create a password" required minLength={6} autoComplete="new-password" />
        <Input label="Confirm password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm password" required autoComplete="new-password" />
      </div>
      <label className="field">
        <span className="field__label">Role</span>
        <select name="role" value={form.role} onChange={handleChange} className="field__input">
          <option value="student">Student</option>
          <option value="company">Company</option>
        </select>
      </label>
      <label className="checkfield"><input type="checkbox" name="accepted" checked={form.accepted} onChange={handleChange} required /> I accept the terms and conditions.</label>
      <Button type="submit" className="w-100" disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
};

export default RegisterForm;

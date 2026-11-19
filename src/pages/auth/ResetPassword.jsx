import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { resetPassword } from '../../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token] = useState(() => searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (token) navigate('/reset-password', { replace: true });
  }, [navigate, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('This reset link is invalid or expired. Request a new one.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (
      password.length < 12
      || !/[a-z]/.test(password)
      || !/[A-Z]/.test(password)
      || !/[0-9]/.test(password)
      || !/[^A-Za-z0-9]/.test(password)
      || new TextEncoder().encode(password).length > 72
    ) {
      setError('Use at least 12 characters with uppercase and lowercase letters, a number, and a symbol.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await resetPassword({ token, password });
      setSuccess(response.message || 'Password reset successfully. You can now log in.');
      setPassword('');
      setConfirmPassword('');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reset your password. Request a new link and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <span className="eyebrow">Reset password</span>
        <h1>Choose a new password</h1>
        <p>Use at least 12 characters with uppercase and lowercase letters, a number, and a symbol.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
          {success ? <p className="auth-feedback auth-feedback--success" role="status">{success}</p> : null}
          {!token ? <p className="auth-feedback auth-feedback--error" role="alert">This reset link is invalid or expired.</p> : null}
          <Input
            label="New password"
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
          />
          <Input
            label="Confirm new password"
            name="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={12}
            maxLength={72}
            autoComplete="new-password"
          />
          <Button type="submit" className="w-100" disabled={isLoading || !token} aria-busy={isLoading}>
            {isLoading ? 'Updating password...' : 'Reset password'}
          </Button>
        </form>
        <p className="auth-footnote"><Link to="/forgot-password" className="text-link">Request a new reset link</Link></p>
        {success ? <p className="auth-footnote"><Link to="/login" className="text-link">Back to login</Link></p> : null}
      </div>
    </section>
  );
};

export default ResetPassword;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { forgotPassword } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const response = await forgotPassword({ email });
      setSuccess(response.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to request a password reset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <span className="eyebrow">Reset password</span>
        <h1>Forgot your password?</h1>
        <p>Enter your email. If an account exists, we will send password reset instructions.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
          {success ? <p className="auth-feedback auth-feedback--success" role="status">{success}</p> : null}
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
          <Button type="submit" className="w-100" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>
        </form>
        <p className="auth-footnote"><Link to="/login" className="text-link">Back to login</Link></p>
      </div>
    </section>
  );
};

export default ForgotPassword;

import { useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="auth-shell">
      <div className="auth-card">
        <span className="eyebrow">Reset password</span>
        <h1>Forgot your password?</h1>
        <p>Enter your email to receive a reset link.</p>
        <form onSubmit={(event) => { event.preventDefault(); setSubmitted(true); }}>
          <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          <Button type="submit" className="w-100">Send reset link</Button>
        </form>
        {submitted && <p className="success-message">Password reset instructions were sent.</p>}
      </div>
    </section>
  );
};

export default ForgotPassword;

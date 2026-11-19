import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import RegisterForm from '../../components/forms/RegisterForm';
import { registerUser } from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setError('');
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!values.accepted) {
      setError('Please accept the terms and conditions.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerUser({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: values.role
      });
      if (!response.data?.token) {
        navigate('/login', {
          replace: true,
          state: { message: response.message || 'Registration successful. Please log in.' }
        });
        return;
      }

      const user = await login(response.data.token);
      const dashboardPaths = {
        student: '/student/dashboard',
        company: '/company/dashboard',
        admin: '/admin/dashboard'
      };
      navigate(dashboardPaths[user.role] || '/unauthorized', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to create your account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card auth-card--wide">
        <div className="auth-copy">
          <span className="eyebrow">Join us</span>
          <h1>Create your account</h1>
          <p>Start your internship and placement journey with a profile built for opportunity.</p>
        </div>
        <div className="auth-panel">
          <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
          <p className="auth-footnote">Already registered? <Link to="/login" className="text-link">Login</Link></p>
        </div>
      </div>
    </section>
  );
};

export default Register;

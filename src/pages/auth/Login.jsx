import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginForm from '../../components/forms/LoginForm';
import { loginUser } from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (values) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await loginUser({ email: values.email, password: values.password });
      if (!response.data?.token) {
        throw new Error('The server did not return a login token. Please try again.');
      }
      const user = await login(response.data.token, values.remember);
      const dashboardPaths = {
        student: '/student/dashboard',
        company: '/company/dashboard',
        admin: '/admin/dashboard'
      };
      navigate(dashboardPaths[user.role] || '/unauthorized', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Unable to log in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-card auth-card--wide">
        <div className="auth-copy">
          <span className="eyebrow">Welcome back</span>
          <h1>Login to your account</h1>
          <p>Manage opportunities, track applications, and discover your next career move.</p>
        </div>
        <div className="auth-panel">
          {location.state?.message ? <p className="auth-feedback auth-feedback--success" role="status">{location.state.message}</p> : null}
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} error={error} />
          <p className="auth-footnote">Need an account? <Link to="/register" className="text-link">Register here</Link></p>
        </div>
      </div>
    </section>
  );
};

export default Login;

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import Loader from '../components/common/Loader';

const ProtectedRoute = ({ children, allow }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader text="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow && user.role !== allow) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

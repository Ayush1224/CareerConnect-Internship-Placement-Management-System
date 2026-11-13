import { useNavigate } from 'react-router-dom';
import Sidebar from '../common/Sidebar';
import { sidebarMenu } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

const DashboardSidebar = ({ role }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Sidebar
      items={sidebarMenu[role] || []}
      title={role === 'student' ? 'Student Panel' : role === 'company' ? 'Company Panel' : 'Admin Panel'}
      onLogout={handleLogout}
    />
  );
};

export default DashboardSidebar;

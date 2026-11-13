import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const AdminLayout = () => (
  <DashboardLayout role="admin">
    <Outlet />
  </DashboardLayout>
);

export default AdminLayout;

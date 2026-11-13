import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const StudentLayout = () => (
  <DashboardLayout role="student">
    <Outlet />
  </DashboardLayout>
);

export default StudentLayout;

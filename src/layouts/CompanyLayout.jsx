import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/dashboard/DashboardLayout';

const CompanyLayout = () => (
  <DashboardLayout role="company">
    <Outlet />
  </DashboardLayout>
);

export default CompanyLayout;

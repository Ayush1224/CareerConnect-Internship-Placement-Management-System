import DashboardSidebar from './DashboardSidebar';

const DashboardLayout = ({ role, children }) => (
  <div className="dashboard-shell">
    <DashboardSidebar role={role} />
    <main className="dashboard-content">{children}</main>
  </div>
);

export default DashboardLayout;

import { Bell, Search } from 'lucide-react';

const DashboardHeader = ({ title, subtitle }) => (
  <header className="dashboard-header">
    <div>
      <p className="eyebrow">Overview</p>
      <h1>{title}</h1>
      <p className="muted">{subtitle}</p>
    </div>
    <div className="header-actions">
      <div className="dashboard-search">
        <Search size={16} />
        <input type="text" placeholder="Search" />
      </div>
      <button type="button" className="icon-button"><Bell size={18} /></button>
    </div>
  </header>
);

export default DashboardHeader;

import { ArrowUpRight } from 'lucide-react';

const StatCard = ({ label, value, change }) => (
  <div className="stat-card">
    <div className="stat-card__meta">
      <span>{label}</span>
      <ArrowUpRight size={16} />
    </div>
    <h3>{value}</h3>
    <p>{change}</p>
  </div>
);

export default StatCard;

const StatusBadge = ({ status }) => {
  const tone = {
    Pending: 'warning',
    Shortlisted: 'info',
    Selected: 'success',
    Rejected: 'danger',
    Active: 'success',
    Open: 'success',
    Closed: 'danger',
    Verified: 'success',
    'In Review': 'warning'
  }[status] || 'neutral';

  return <span className={`status-badge status-badge--${tone}`}>{status}</span>;
};

export default StatusBadge;

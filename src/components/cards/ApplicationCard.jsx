import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

const ApplicationCard = ({ application }) => {
  const appliedDate = new Date(application.appliedAt).toLocaleDateString();

  return (
    <div className="application-card">
      <div>
        <h4>{application.jobTitle}</h4>
        <p>{application.company}</p>
      </div>
      <div>Applied: {appliedDate}</div>
      <StatusBadge status={application.status} />
      {application.jobId ? <Link to={`/jobs/${application.jobId}`} className="text-link">View job</Link> : null}
    </div>
  );
};

export default ApplicationCard;

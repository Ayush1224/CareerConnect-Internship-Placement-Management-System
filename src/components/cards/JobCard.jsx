import { Link } from 'react-router-dom';
import { BriefcaseBusiness, MapPin, CalendarDays, Bookmark } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { formatJobDeadline } from '../../utils/jobFormat';

const JobCard = ({ job }) => {
  const company = job.companyId?.companyName || job.company || 'Company';
  const jobType = job.jobType || job.type || 'Internship';
  const skills = job.skillsRequired || job.skills || [];
  const compensation = job.salary ?? job.stipend;
  const deadline = job.applicationDeadline || job.deadline;
  const jobId = job._id || job.id;

  return (
    <article className="job-card">
      <div className="job-card__header">
        <div className="job-card__logo">{company.slice(0, 2).toUpperCase()}</div>
        <button type="button" className="icon-button" aria-label="Save job"><Bookmark size={16} /></button>
      </div>
      <div className="job-card__body">
        <div className="job-card__topline">
          <StatusBadge status={jobType} />
          <span>{company}</span>
        </div>
        <h3>{job.title}</h3>
        <div className="job-meta">
          <span><MapPin size={14} /> {job.location || 'Location not specified'}</span>
          <span><BriefcaseBusiness size={14} /> {jobType}</span>
          <span><CalendarDays size={14} /> {formatJobDeadline(deadline)}</span>
        </div>
        <p>{job.description}</p>
        <div className="tag-list">
          {skills.slice(0, 3).map((skill) => <span key={skill} className="tag">{skill}</span>)}
        </div>
      </div>
      <div className="job-card__footer">
        <strong>{compensation === undefined ? 'Compensation not specified' : `₹${compensation}`}</strong>
        <Link to={`/jobs/${jobId}`} className="btn btn--primary btn--sm">View details</Link>
      </div>
    </article>
  );
};

export default JobCard;

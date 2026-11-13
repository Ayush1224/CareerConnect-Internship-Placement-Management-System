import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BriefcaseBusiness, CalendarDays, DollarSign, MapPin, Sparkles, Users } from 'lucide-react';
import Loader from '../../components/common/Loader';
import JobApplicationForm from '../../components/forms/JobApplicationForm';
import { useAuth } from '../../context/AuthContext';
import { getJobById } from '../../services/jobService';
import { formatJobDeadline } from '../../utils/jobFormat';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [result, setResult] = useState({ id: null, job: null, error: '' });

  useEffect(() => {
    let active = true;
    getJobById(id)
      .then((response) => {
        if (active) setResult({ id, job: response.data.job, error: '' });
      })
      .catch((requestError) => {
        if (active) {
          setResult({
            id,
            job: null,
            error: requestError.response?.data?.message || 'Unable to load this job.'
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const isLoading = result.id !== id;
  const job = isLoading ? null : result.job;
  const error = isLoading ? '' : result.error;

  if (isLoading) {
    return <section className="page-shell"><div className="container"><Loader text="Loading job details..." /></div></section>;
  }
  if (error || !job) {
    return (
      <section className="page-shell">
        <div className="container job-details">
          <p className="auth-feedback auth-feedback--error" role="alert">{error || 'Job not found.'}</p>
          <Link to="/jobs" className="btn btn--secondary">Back to jobs</Link>
        </div>
      </section>
    );
  }

  const company = job.companyId?.companyName || 'Company';
  const jobType = job.jobType || 'Internship';
  const skills = job.skillsRequired || [];
  const compensation = job.salary ?? job.stipend;
  const deadline = formatJobDeadline(job.applicationDeadline);

  return (
    <section className="page-shell">
      <div className="container job-details">
        <div className="job-details__header">
          <div>
            <span className="eyebrow">{company}</span>
            <h1>{job.title}</h1>
          </div>
          <Link to="/jobs" className="btn btn--secondary">Back to jobs</Link>
        </div>

        <div className="job-details__content">
          <div className="job-detail-panel">
            <div className="job-detail-meta">
              <span><MapPin size={16} /> {job.location || 'Location not specified'}</span>
              <span><BriefcaseBusiness size={16} /> {jobType}</span>
              <span><DollarSign size={16} /> {compensation === undefined ? 'Compensation not specified' : `₹${compensation}`}</span>
              <span><CalendarDays size={16} /> Apply by {deadline}</span>
            </div>
            <p>{job.description}</p>
            {job.requirements ? <p><strong>Requirements:</strong> {job.requirements}</p> : null}
            <div className="tag-list">
              {skills.map((skill) => <span key={skill} className="tag">{skill}</span>)}
            </div>
            {user?.role === 'student' ? (
              <JobApplicationForm key={job._id} jobId={job._id} />
            ) : !user ? (
              <Link to="/login" className="btn btn--primary">Log in to apply</Link>
            ) : null}
          </div>

          <aside className="job-detail-sidebar">
            <div className="company-summary">
              <div className="company-summary__logo">{company.slice(0, 2).toUpperCase()}</div>
              <h3>{company}</h3>
              <p>Hiring for {job.title}</p>
            </div>
            <div className="detail-list">
              <div><Users size={16} /> {job.vacancies} vacancies</div>
              <div><Sparkles size={16} /> Experience: {job.experience || 'Not specified'}</div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default JobDetails;

import { useEffect, useState } from 'react';
import JobCard from '../../components/cards/JobCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { getJobs } from '../../services/jobService';

const BrowseJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getJobs()
      .then((response) => {
        if (active) setJobs(response.data.jobs);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load current job opportunities.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Browse jobs</span>
          <h1>Recommended opportunities</h1>
        </div>
      </div>
      {isLoading ? <Loader text="Loading jobs..." /> : null}
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      {!isLoading && !error && jobs.length === 0 ? (
        <EmptyState title="No open jobs right now" description="Check back soon for new opportunities." />
      ) : null}
      {!isLoading && !error && jobs.length > 0 ? (
        <div className="card-grid card-grid--jobs">
          {jobs.map((job) => <JobCard key={job._id} job={job} />)}
        </div>
      ) : null}
    </div>
  );
};

export default BrowseJobs;

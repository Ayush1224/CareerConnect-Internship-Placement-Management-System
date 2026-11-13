import { useEffect, useState } from 'react';
import ApplicationCard from '../../components/cards/ApplicationCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { getApplications } from '../../services/applicationService';

const MyApplications = () => {
  const [search, setSearch] = useState('');
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getApplications()
      .then((response) => {
        if (active) setApplications(response.data.applications);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load your applications.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filteredApplications = applications.filter((application) => (
    `${application.company} ${application.jobTitle}`.toLowerCase().includes(search.toLowerCase())
  ));

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Applications</span>
          <h1>My applications</h1>
        </div>
      </div>
      <div className="panel-card padded">
        <input className="search-input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by company or role" />
        {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
        {isLoading ? <Loader text="Loading your applications..." /> : (
          filteredApplications.length ? (
            <div className="stack-list">
              {filteredApplications.map((application) => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={applications.length ? 'No matching applications' : 'No applications yet'}
              description={applications.length ? 'Try another company or job title.' : 'Applications you submit will appear here.'}
            />
          )
        )}
      </div>
    </div>
  );
};

export default MyApplications;

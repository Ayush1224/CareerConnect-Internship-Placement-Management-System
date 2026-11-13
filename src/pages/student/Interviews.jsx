import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import { getMyInterviews } from '../../services/interviewService';

const getSafeMeetingLink = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
};

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getMyInterviews()
      .then((response) => {
        if (active) setInterviews(response.data.interviews);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Unable to load your interviews.');
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
          <span className="eyebrow">Interviews</span>
          <h1>My interviews</h1>
        </div>
      </div>
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      {isLoading ? <Loader text="Loading your interviews..." /> : interviews.length ? (
        <div className="interview-list interview-list--student">
          {interviews.map((interview) => {
            const meetingLink = getSafeMeetingLink(interview.meetingLink);
            return (
              <article className="panel-card interview-item" key={interview._id}>
                <div className="interview-item__header">
                  <div>
                    <h3>{interview.jobTitle}</h3>
                    <p>{interview.company}</p>
                    <p className="muted">{new Date(interview.scheduledAt).toLocaleString()}</p>
                  </div>
                  <StatusBadge status={interview.status} />
                </div>
                {meetingLink ? (
                  <a className="text-link" href={meetingLink} target="_blank" rel="noreferrer">Join meeting</a>
                ) : <p className="muted">Meeting link not provided.</p>}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No interviews scheduled" description="Your upcoming interviews will appear here." />
      )}
    </div>
  );
};

export default Interviews;

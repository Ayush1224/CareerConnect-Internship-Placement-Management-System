import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ApplicantCard from '../../components/cards/ApplicantCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { getCompanyApplicants, updateApplicationStatus } from '../../services/applicationService';
import { getCompanyJobs } from '../../services/jobService';

const ViewApplicants = () => {
  const { jobId } = useParams();
  const [jobs, setJobs] = useState([]);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadedFor, setLoadedFor] = useState('');
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const requestKey = jobId || 'all';

  useEffect(() => {
    let active = true;
    const request = jobId ? getCompanyApplicants(jobId) : getCompanyJobs();
    request
      .then((response) => {
        if (!active) return;
        setError('');
        setSuccess('');
        if (jobId) {
          setJob(response.data.job);
          setApplications(response.data.applications);
        } else {
          setJobs(response.data.jobs);
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load applicants.');
        }
      })
      .finally(() => {
        if (active) setLoadedFor(requestKey);
      });

    return () => {
      active = false;
    };
  }, [jobId, requestKey]);

  const handleStatusChange = async (applicationId, status) => {
    setUpdatingId(applicationId);
    setError('');
    setSuccess('');
    try {
      const response = await updateApplicationStatus(applicationId, status);
      setApplications((current) => current.map((application) => (
        application._id === applicationId
          ? { ...application, status: response.data.application.status }
          : application
      )));
      setSuccess(response.message || 'Application status updated.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update application status.');
    } finally {
      setUpdatingId('');
    }
  };

  const isLoading = loadedFor !== requestKey;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Applicants</span>
          <h1>{jobId && job ? `Applicants: ${job.title}` : 'Applicants by job'}</h1>
          {jobId && job ? <p className="muted">Job status: {job.status}. Existing applications remain available after closing.</p> : null}
        </div>
        <Link to="/company/jobs" className="btn btn--secondary">Manage jobs</Link>
      </div>
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      {success ? <p className="auth-feedback auth-feedback--success" role="status">{success}</p> : null}
      {isLoading ? <Loader text="Loading applicants..." /> : jobId ? (
        applications.length ? (
          <div className="card-grid card-grid--applicants">
            {applications.map((application) => (
              <ApplicantCard
                key={application._id}
                application={application}
                onStatusChange={handleStatusChange}
                isUpdating={updatingId === application._id}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No applicants yet" description="Applications for this job will appear here." />
        )
      ) : jobs.length ? (
        <div className="stack-list">
          {jobs.map((companyJob) => (
            <div className="mini-list-item" key={companyJob._id}>
              <div>
                <strong>{companyJob.title}</strong>
                <span>{companyJob.status}</span>
              </div>
              <Link className="text-link" to={`/company/jobs/${companyJob._id}/applicants`}>View applicants</Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No jobs posted yet" description="Post a job to start receiving applications." />
      )}
    </div>
  );
};

export default ViewApplicants;

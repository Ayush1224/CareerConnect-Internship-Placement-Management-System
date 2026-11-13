import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import JobForm from '../../components/forms/JobForm';
import { closeJob, getCompanyJobs, updateJob } from '../../services/jobService';
import { formatJobDeadline } from '../../utils/jobFormat';

const ManageJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const loadJobs = useCallback(async () => {
    try {
      const response = await getCompanyJobs();
      setJobs(response.data.jobs);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your jobs.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const fetchJobs = async () => {
      try {
        const response = await getCompanyJobs();
        if (active) setJobs(response.data.jobs);
      } catch (requestError) {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load your jobs.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    fetchJobs();
    return () => {
      active = false;
    };
  }, []);

  const handleUpdate = async (payload) => {
    setIsSaving(true);
    setError('');
    try {
      await updateJob(editingJob._id, payload);
      setEditingJob(null);
      await loadJobs();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this job.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = async (jobId) => {
    setError('');
    try {
      await closeJob(jobId);
      await loadJobs();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to close this job.');
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Jobs</span>
          <h1>Manage postings</h1>
        </div>
        <Link to="/company/jobs/create" className="btn btn--primary">Post a new job</Link>
      </div>
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      {isLoading ? <Loader text="Loading your jobs..." /> : (
        <div className="panel-card padded">
          {jobs.length === 0 ? (
            <EmptyState title="No jobs posted yet" description="Create a posting to reach students." />
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job._id}>
                    <td>{job.title}</td>
                    <td>{job.jobType}</td>
                    <td>{formatJobDeadline(job.applicationDeadline)}</td>
                    <td><StatusBadge status={job.status} /></td>
                    <td>
                      <Link to={`/company/jobs/${job._id}/applicants`} className="table-link">View applicants</Link>
                      {' '}
                      <button type="button" className="table-link" onClick={() => setEditingJob(job)}>Edit</button>
                      {' '}
                      <button
                        type="button"
                        className="table-link table-link--danger"
                        onClick={() => handleClose(job._id)}
                        disabled={job.status === 'Closed'}
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      {editingJob ? (
        <section className="panel-card padded">
          <h2>Edit {editingJob.title}</h2>
          <JobForm
            key={editingJob._id}
            job={editingJob}
            onSubmit={handleUpdate}
            isLoading={isSaving}
            error={error}
          />
          <button type="button" className="table-link" onClick={() => setEditingJob(null)}>Cancel edit</button>
        </section>
      ) : null}
    </div>
  );
};

export default ManageJobs;

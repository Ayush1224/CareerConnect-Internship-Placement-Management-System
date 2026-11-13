import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/cards/StatCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import JobForm from '../../components/forms/JobForm';
import { getMyCompanyProfile } from '../../services/companyService';
import { createJob, getCompanyJobs } from '../../services/jobService';
import { formatJobDeadline } from '../../utils/jobFormat';

const CompanyDashboard = () => {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([getMyCompanyProfile(), getCompanyJobs()])
      .then(([profileResponse, jobsResponse]) => {
        if (!active) return;
        setCompany(profileResponse.data.company);
        setJobs(jobsResponse.data.jobs);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load your company dashboard.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (payload) => {
    setFormError('');
    setSuccess('');
    setIsSaving(true);
    try {
      const response = await createJob(payload);
      setJobs((current) => [response.data.job, ...current]);
      setSuccess(response.message || 'Job published successfully.');
    } catch (requestError) {
      setFormError(requestError.response?.data?.message || 'Unable to publish this job.');
    } finally {
      setIsSaving(false);
    }
  };

  const activeJobs = jobs.filter((job) => job.status === 'Active').length;
  const draftJobs = jobs.filter((job) => job.status === 'Draft').length;
  const closedJobs = jobs.filter((job) => job.status === 'Closed').length;

  return (
    <div className="dashboard-page">
      <DashboardHeader title="Company dashboard" subtitle="Manage your company profile and job postings." />
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      {isLoading ? <Loader text="Loading your company dashboard..." /> : (
        <>
          <section className="stats-grid">
            <StatCard label="Job postings" value={jobs.length} change="Total postings" />
            <StatCard label="Active jobs" value={activeJobs} change="Visible to students" />
            <StatCard label="Draft jobs" value={draftJobs} change="Not visible to students" />
            <StatCard label="Closed jobs" value={closedJobs} change="No longer accepting applicants" />
          </section>
          {!company ? (
            <EmptyState
              title="Set up your company profile"
              description="Add your company name before publishing a job."
              action={<Link to="/company/profile" className="btn btn--primary">Complete company profile</Link>}
            />
          ) : (
            <>
              <section className="panel-card padded">
                <h2>Your job postings</h2>
                {jobs.length === 0 ? (
                  <EmptyState title="No jobs posted yet" description="Create your first posting using the form below." />
                ) : (
                  <div className="stack-list">
                    {jobs.map((job) => (
                      <div className="mini-list-item" key={job._id}>
                        <div>
                          <strong>{job.title}</strong>
                          <span>{job.jobType} · {formatJobDeadline(job.applicationDeadline)}</span>
                        </div>
                        <StatusBadge status={job.status} />
                      </div>
                    ))}
                  </div>
                )}
                <p><Link to="/company/jobs" className="text-link">Manage all jobs</Link></p>
              </section>
              <section className="panel-card padded">
                <h2>Post a job</h2>
                {success ? <p className="auth-feedback auth-feedback--success" role="status">{success}</p> : null}
                <JobForm onSubmit={handleCreate} isLoading={isSaving} error={formError} />
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CompanyDashboard;

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/cards/StatCard';
import ApplicationCard from '../../components/cards/ApplicationCard';
import JobCard from '../../components/cards/JobCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { applications, dashboardCards } from '../../data/mockData';
import { getJobs } from '../../services/jobService';

const StudentDashboard = () => {
  const { user } = useAuth();
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
      <DashboardHeader title={`Welcome back, ${user?.name || 'Student'}`} subtitle="Here is a snapshot of your career progress." />
      <section className="stats-grid">
        {dashboardCards.student.map((card) => (
          <StatCard key={card.label} label={card.label} value={card.value} change={card.change} />
        ))}
      </section>
      <section className="two-column-panel">
        <div className="panel-card">
          <h3>Recent applications</h3>
          {applications.slice(0, 3).map((application) => <ApplicationCard key={application.id} application={application} />)}
        </div>
        <div className="panel-card">
          <h3>Active opportunities</h3>
          {isLoading ? <Loader text="Loading jobs..." /> : null}
          {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
          {!isLoading && !error && jobs.length === 0 ? (
            <EmptyState title="No open jobs right now" description="Check back soon for new opportunities." />
          ) : null}
        </div>
      </section>
      {!isLoading && !error && jobs.length > 0 ? (
        <section className="card-grid card-grid--jobs">
          {jobs.map((job) => <JobCard key={job._id} job={job} />)}
        </section>
      ) : null}
    </div>
  );
};

export default StudentDashboard;

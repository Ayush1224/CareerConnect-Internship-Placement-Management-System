import { useEffect, useState } from 'react';
import DashboardHeader from '../../components/dashboard/DashboardHeader';
import StatCard from '../../components/cards/StatCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import { getAdminDashboard } from '../../services/adminService';

const AdminDashboard = () => {
  const [counts, setCounts] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getAdminDashboard()
      .then((response) => {
        if (active) setCounts(response.data.counts);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.message || 'Unable to load dashboard data.');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const cards = counts ? [
    { label: 'Students', value: counts.students, change: 'Registered accounts' },
    { label: 'Companies', value: counts.companies, change: 'Company profiles' },
    { label: 'Active jobs', value: counts.activeJobs, change: 'Open and unexpired' },
    { label: 'Applications', value: counts.applications, change: 'Submitted applications' },
    { label: 'Upcoming interviews', value: counts.upcomingInterviews, change: 'Scheduled interviews' }
  ] : [];
  const hasRecords = counts && Object.values(counts).some((count) => count > 0);

  return (
    <div className="dashboard-page">
      <DashboardHeader title="Admin dashboard" subtitle="Monitor platform growth, users and recruitment health." />
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      {isLoading ? <Loader text="Loading dashboard data..." /> : counts ? (
        <>
          {!hasRecords ? (
            <EmptyState
              title="No platform activity yet"
              description="Dashboard counts will appear here as users and recruitment activity are added."
            />
          ) : null}
          <section className="stats-grid">
            {cards.map((card) => (
              <StatCard key={card.label} label={card.label} value={card.value} change={card.change} />
            ))}
          </section>
        </>
      ) : null}
    </div>
  );
};

export default AdminDashboard;

import { useEffect, useMemo, useState } from 'react';
import JobCard from '../../components/cards/JobCard';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import { getJobs } from '../../services/jobService';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('All');
  const [jobType, setJobType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
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

  const locations = useMemo(
    () => [...new Set(jobs.map((job) => job.location).filter(Boolean))].sort(),
    [jobs]
  );
  const filteredJobs = useMemo(() => jobs.filter((job) => {
    const company = job.companyId?.companyName || '';
    const matchesSearch = `${job.title} ${company}`.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = location === 'All' || job.location === location;
    const matchesType = jobType === 'All' || job.jobType === jobType;
    return matchesSearch && matchesLocation && matchesType;
  }), [jobs, search, location, jobType]);

  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <section className="page-shell">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Career opportunities</span>
            <h1>Find the right internship or role.</h1>
          </div>
        </div>
        <div className="filter-panel">
          <SearchBar value={search} onChange={(event) => { setSearch(event.target.value); setCurrentPage(1); }} placeholder="Search by title or company" className="search-large" />
          <select value={location} onChange={(event) => { setLocation(event.target.value); setCurrentPage(1); }}>
            <option value="All">All locations</option>
            {locations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <select value={jobType} onChange={(event) => { setJobType(event.target.value); setCurrentPage(1); }}>
            <option value="All">All types</option>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
          </select>
        </div>
        {isLoading ? <Loader text="Loading jobs..." /> : null}
        {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
        {!isLoading && !error && paginatedJobs.length === 0 ? (
          <EmptyState title="No jobs found" description="Try changing the search or filters." />
        ) : null}
        {!isLoading && !error && paginatedJobs.length > 0 ? (
          <div className="card-grid card-grid--jobs">
            {paginatedJobs.map((job) => <JobCard key={job._id} job={job} />)}
          </div>
        ) : null}
        {!isLoading && !error && paginatedJobs.length > 0 ? (
          <Pagination currentPage={currentPage} pageCount={totalPages} onPageChange={setCurrentPage} />
        ) : null}
      </div>
    </section>
  );
};

export default Jobs;

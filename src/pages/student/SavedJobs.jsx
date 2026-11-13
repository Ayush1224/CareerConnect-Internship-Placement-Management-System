import { jobs } from '../../data/mockData';
import JobCard from '../../components/cards/JobCard';

const SavedJobs = () => (
  <div className="dashboard-page">
    <div className="page-header">
      <div>
        <span className="eyebrow">Saved</span>
        <h1>Saved jobs</h1>
      </div>
    </div>
    <div className="card-grid card-grid--jobs">
      {jobs.slice(0, 2).map((job) => <JobCard key={job.id} job={job} />)}
    </div>
  </div>
);

export default SavedJobs;

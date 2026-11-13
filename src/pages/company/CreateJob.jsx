import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import JobForm from '../../components/forms/JobForm';
import { createJob } from '../../services/jobService';

const CreateJob = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (payload) => {
    setError('');
    setIsLoading(true);
    try {
      await createJob(payload);
      navigate('/company/jobs');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to publish this job.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <span className="eyebrow">Hiring</span>
          <h1>Post a new job</h1>
        </div>
      </div>
      <div className="panel-card padded">
        {error.includes('company profile') ? (
          <p className="auth-feedback auth-feedback--error" role="alert">
            {error} <Link to="/company/profile" className="text-link">Complete your profile</Link>
          </p>
        ) : null}
        <JobForm onSubmit={handleSubmit} isLoading={isLoading} error={error.includes('company profile') ? '' : error} />
      </div>
    </div>
  );
};

export default CreateJob;

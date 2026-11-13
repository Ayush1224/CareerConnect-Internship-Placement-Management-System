import { useState } from 'react';
import { Link } from 'react-router-dom';
import { applyToJob } from '../../services/applicationService';

const JobApplicationForm = ({ jobId }) => {
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const response = await applyToJob(jobId, { coverLetter });
      setMessage(response.message || 'Application submitted successfully.');
      setHasApplied(true);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to submit your application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      <h2>Apply for this job</h2>
      <p className="muted">Your resume from your student profile will be attached if available. A cover letter is optional.</p>
      <label className="field">
        <span className="field__label">Cover letter</span>
        <textarea
          className="field__input"
          rows="5"
          maxLength="10000"
          value={coverLetter}
          onChange={(event) => setCoverLetter(event.target.value)}
          placeholder="Tell the company why you are interested in this role"
        />
      </label>
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      {message ? (
        <p className="auth-feedback auth-feedback--success" role="status">
          {message} <Link to="/student/applications" className="text-link">View my applications</Link>
        </p>
      ) : null}
      <button type="submit" className="btn btn--primary" disabled={isSubmitting || hasApplied} aria-busy={isSubmitting}>
        {isSubmitting ? 'Submitting application...' : hasApplied ? 'Application submitted' : 'Apply now'}
      </button>
    </form>
  );
};

export default JobApplicationForm;

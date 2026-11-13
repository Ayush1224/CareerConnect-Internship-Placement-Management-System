import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const makeFormValues = (job) => ({
  title: job?.title || '',
  location: job?.location || '',
  jobType: job?.jobType || 'Internship',
  compensation: job?.stipend ?? job?.salary ?? '',
  experience: job?.experience || '',
  applicationDeadline: job?.applicationDeadline ? new Date(job.applicationDeadline).toISOString().slice(0, 10) : '',
  vacancies: job?.vacancies || 1,
  skillsRequired: (job?.skillsRequired || []).join(', '),
  description: job?.description || '',
  requirements: job?.requirements || '',
  status: job?.status || 'Active'
});

const JobForm = ({ job, onSubmit, isLoading = false, error }) => {
  const [form, setForm] = useState(() => makeFormValues(job));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const payload = {
      title: form.title,
      location: form.location,
      jobType: form.jobType,
      experience: form.experience,
      applicationDeadline: form.applicationDeadline || undefined,
      vacancies: Number(form.vacancies),
      skillsRequired: form.skillsRequired.split(',').map((skill) => skill.trim()).filter(Boolean),
      description: form.description,
      requirements: form.requirements,
      status: form.status
    };
    if (form.compensation !== '') {
      payload[form.jobType === 'Internship' ? 'stipend' : 'salary'] = Number(form.compensation);
    }
    onSubmit(payload);
  };

  return (
    <form className="stack-form" onSubmit={handleSubmit}>
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      <div className="form-grid">
        <Input label="Job title" name="title" value={form.title} onChange={handleChange} placeholder="Senior Product Designer" required />
        <Input label="Location" name="location" value={form.location} onChange={handleChange} placeholder="Bengaluru" required />
        <label className="field">
          <span className="field__label">Job type</span>
          <select className="field__input" name="jobType" value={form.jobType} onChange={handleChange}>
            <option value="Internship">Internship</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
          </select>
        </label>
        <Input label="Salary / stipend" name="compensation" type="number" min="0" step="0.01" value={form.compensation} onChange={handleChange} placeholder="18000" />
        <Input label="Experience" name="experience" value={form.experience} onChange={handleChange} placeholder="1-3 years" />
        <Input label="Application deadline" name="applicationDeadline" type="date" value={form.applicationDeadline} onChange={handleChange} />
        <Input label="Vacancies" name="vacancies" type="number" min="1" value={form.vacancies} onChange={handleChange} required />
        <label className="field">
          <span className="field__label">Posting status</span>
          <select className="field__input" name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </select>
        </label>
      </div>
      <label className="field">
        <span className="field__label">Skills</span>
        <textarea className="field__input" name="skillsRequired" rows="3" value={form.skillsRequired} onChange={handleChange} placeholder="React, Node.js, Design Systems" />
      </label>
      <label className="field">
        <span className="field__label">Job description</span>
        <textarea className="field__input" name="description" rows="5" value={form.description} onChange={handleChange} placeholder="Describe the role and responsibilities" required />
      </label>
      <label className="field">
        <span className="field__label">Requirements</span>
        <textarea className="field__input" name="requirements" rows="3" value={form.requirements} onChange={handleChange} placeholder="Experience, education, or other requirements" />
      </label>
      <Button type="submit" disabled={isLoading} aria-busy={isLoading}>
        {isLoading ? 'Saving job...' : job ? 'Save changes' : 'Publish job'}
      </Button>
    </form>
  );
};

export default JobForm;

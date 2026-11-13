import StatusBadge from '../common/StatusBadge';
import InterviewManager from '../company/InterviewManager';

const ApplicantCard = ({ application, onStatusChange, isUpdating }) => {
  const student = application.student;
  const resumeHref = /^https?:\/\//i.test(application.resume || '') ? application.resume : '';
  const appliedAt = new Date(application.appliedAt).toLocaleString();

  return (
    <article className="applicant-card">
      <div className="applicant-card__header">
        <div className="avatar">{student?.name?.[0] || 'A'}</div>
        <div>
          <h4>{student?.name || 'Applicant'}</h4>
          <p>{student?.college || student?.email || 'Student profile not provided'}</p>
          {student?.email && student?.college ? <p>{student.email}</p> : null}
        </div>
        <StatusBadge status={application.status} />
      </div>
      <p>{[student?.degree, student?.branch, student?.graduationYear].filter(Boolean).join(' · ') || 'Education not provided'}</p>
      <p>Applied: {appliedAt}</p>
      <div className="tag-list">
        {(student?.skills || []).map((skill) => <span key={skill} className="tag">{skill}</span>)}
      </div>
      {application.coverLetter ? <p><strong>Cover letter:</strong> {application.coverLetter}</p> : <p>No cover letter submitted.</p>}
      <div className="applicant-card__actions">
        {resumeHref ? (
          <a className="btn btn--secondary btn--sm" href={resumeHref} target="_blank" rel="noreferrer">View resume</a>
        ) : <span className="muted">No resume on profile</span>}
        <label className="field">
          <span className="field__label">{isUpdating ? 'Updating status...' : 'Application status'}</span>
          <select
            className="field__input"
            value={application.status}
            disabled={isUpdating}
            onChange={(event) => onStatusChange(application._id, event.target.value)}
          >
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Rejected">Rejected</option>
            <option value="Selected">Selected</option>
          </select>
        </label>
      </div>
      <InterviewManager application={application} />
    </article>
  );
};

export default ApplicantCard;

import { useRef, useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import {
  cancelInterview,
  completeInterview,
  rescheduleInterview,
  scheduleInterview
} from '../../services/interviewService';

const toLocalInputValue = (value) => {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const initialSchedule = () => ({
  scheduledAt: toLocalInputValue(Date.now() + 60 * 60 * 1000),
  meetingLink: '',
  notes: ''
});

const initialRescheduleValues = (interviews) => Object.fromEntries(interviews.map((interview) => [
  interview._id,
  {
    scheduledAt: toLocalInputValue(interview.scheduledAt),
    meetingLink: interview.meetingLink || '',
    notes: interview.notes || ''
  }
]));

const InterviewManager = ({ application }) => {
  const [interviews, setInterviews] = useState(() => application.interviews || []);
  const [rescheduleValues, setRescheduleValues] = useState(() => initialRescheduleValues(application.interviews || []));
  const [scheduleValues, setScheduleValues] = useState(initialSchedule);
  const [busyAction, setBusyAction] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const idempotencyKeys = useRef({});

  const getRequestKey = (action) => {
    if (!idempotencyKeys.current[action]) {
      idempotencyKeys.current[action] = globalThis.crypto.randomUUID();
    }
    return idempotencyKeys.current[action];
  };

  const clearRequestKey = (action) => {
    delete idempotencyKeys.current[action];
  };

  const replaceInterview = (interview) => {
    setInterviews((current) => current.map((item) => (
      item._id === interview._id ? interview : item
    )));
    setRescheduleValues((current) => ({
      ...current,
      [interview._id]: {
        scheduledAt: toLocalInputValue(interview.scheduledAt),
        meetingLink: interview.meetingLink || '',
        notes: interview.notes || ''
      }
    }));
  };

  const handleSchedule = async (event) => {
    event.preventDefault();
    setBusyAction('schedule');
    setError('');
    setSuccess('');
    try {
      const response = await scheduleInterview({
        applicationId: application._id,
        scheduledAt: new Date(scheduleValues.scheduledAt).toISOString(),
        meetingLink: scheduleValues.meetingLink,
        notes: scheduleValues.notes
      }, getRequestKey(`schedule:${application._id}`));
      const interview = response.data.interview;
      setInterviews((current) => [...current, interview]);
      setRescheduleValues((current) => ({
        ...current,
        [interview._id]: {
          scheduledAt: toLocalInputValue(interview.scheduledAt),
          meetingLink: interview.meetingLink || '',
          notes: interview.notes || ''
        }
      }));
      setScheduleValues(initialSchedule());
      clearRequestKey(`schedule:${application._id}`);
      setSuccess(response.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to schedule the interview.');
    } finally {
      setBusyAction('');
    }
  };

  const handleReschedule = async (event, interview) => {
    event.preventDefault();
    const action = `reschedule:${interview._id}`;
    setBusyAction(action);
    setError('');
    setSuccess('');
    try {
      const values = rescheduleValues[interview._id];
      const response = await rescheduleInterview(interview._id, {
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        meetingLink: values.meetingLink,
        notes: values.notes
      }, getRequestKey(action));
      replaceInterview(response.data.interview);
      clearRequestKey(action);
      setSuccess(response.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to reschedule the interview.');
    } finally {
      setBusyAction('');
    }
  };

  const handleStatusAction = async (interview, action) => {
    const key = `${action}:${interview._id}`;
    setBusyAction(key);
    setError('');
    setSuccess('');
    try {
      const response = action === 'cancel'
        ? await cancelInterview(interview._id, getRequestKey(key))
        : await completeInterview(interview._id);
      replaceInterview(response.data.interview);
      if (action === 'cancel') clearRequestKey(key);
      setSuccess(response.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Unable to ${action} the interview.`);
    } finally {
      setBusyAction('');
    }
  };

  return (
    <section className="interview-manager" aria-label="Interview scheduling">
      <h4>Interviews</h4>
      {error ? <p className="auth-feedback auth-feedback--error" role="alert">{error}</p> : null}
      {success ? <p className="auth-feedback auth-feedback--success" role="status">{success}</p> : null}
      {interviews.length ? (
        <div className="interview-list">
          {interviews.map((interview) => {
            const action = `reschedule:${interview._id}`;
            const values = rescheduleValues[interview._id] || {};
            return (
              <article className="interview-item" key={interview._id}>
                <div className="interview-item__header">
                  <div>
                    <strong>{new Date(interview.scheduledAt).toLocaleString()}</strong>
                    <p className="muted">{interview.meetingLink || 'No meeting link provided'}</p>
                  </div>
                  <StatusBadge status={interview.status} />
                </div>
                {interview.status === 'Scheduled' ? (
                  <>
                    <form className="interview-form" onSubmit={(event) => handleReschedule(event, interview)}>
                      <label className="field">
                        <span className="field__label">Reschedule to</span>
                        <input
                          className="field__input"
                          type="datetime-local"
                          required
                          value={values.scheduledAt || ''}
                          onChange={(event) => setRescheduleValues((current) => ({
                            ...current,
                            [interview._id]: { ...current[interview._id], scheduledAt: event.target.value }
                          }))}
                        />
                      </label>
                      <label className="field">
                        <span className="field__label">Meeting link</span>
                        <input
                          className="field__input"
                          type="url"
                          placeholder="https://..."
                          value={values.meetingLink || ''}
                          onChange={(event) => setRescheduleValues((current) => ({
                            ...current,
                            [interview._id]: { ...current[interview._id], meetingLink: event.target.value }
                          }))}
                        />
                      </label>
                      <label className="field">
                        <span className="field__label">Notes</span>
                        <textarea
                          className="field__input"
                          value={values.notes || ''}
                          onChange={(event) => setRescheduleValues((current) => ({
                            ...current,
                            [interview._id]: { ...current[interview._id], notes: event.target.value }
                          }))}
                        />
                      </label>
                      <div className="interview-actions">
                        <button className="btn btn--secondary btn--sm" type="submit" disabled={busyAction === action}>
                          {busyAction === action ? 'Saving...' : 'Save new time'}
                        </button>
                        <button
                          className="btn btn--danger btn--sm"
                          type="button"
                          disabled={busyAction === `cancel:${interview._id}`}
                          onClick={() => handleStatusAction(interview, 'cancel')}
                        >
                          {busyAction === `cancel:${interview._id}` ? 'Cancelling...' : 'Cancel'}
                        </button>
                        <button
                          className="btn btn--ghost btn--sm"
                          type="button"
                          disabled={busyAction === `complete:${interview._id}`}
                          onClick={() => handleStatusAction(interview, 'complete')}
                        >
                          {busyAction === `complete:${interview._id}` ? 'Saving...' : 'Mark completed'}
                        </button>
                      </div>
                    </form>
                  </>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : (
        <p className="muted">No interviews scheduled yet.</p>
      )}
      {application.status === 'Shortlisted' ? (
        <form className="interview-form interview-form--schedule" onSubmit={handleSchedule}>
          <h5>Schedule another round</h5>
          <label className="field">
            <span className="field__label">Date and time (your local time)</span>
            <input
              className="field__input"
              type="datetime-local"
              required
              value={scheduleValues.scheduledAt}
              onChange={(event) => setScheduleValues((current) => ({ ...current, scheduledAt: event.target.value }))}
            />
          </label>
          <label className="field">
            <span className="field__label">Meeting link</span>
            <input
              className="field__input"
              type="url"
              placeholder="https://..."
              value={scheduleValues.meetingLink}
              onChange={(event) => setScheduleValues((current) => ({ ...current, meetingLink: event.target.value }))}
            />
          </label>
          <label className="field">
            <span className="field__label">Notes</span>
            <textarea
              className="field__input"
              value={scheduleValues.notes}
              onChange={(event) => setScheduleValues((current) => ({ ...current, notes: event.target.value }))}
            />
          </label>
          <button className="btn btn--primary btn--sm" type="submit" disabled={busyAction === 'schedule'}>
            {busyAction === 'schedule' ? 'Scheduling...' : 'Schedule interview'}
          </button>
        </form>
      ) : (
        <p className="muted">Shortlist this applicant to schedule an interview.</p>
      )}
    </section>
  );
};

export default InterviewManager;

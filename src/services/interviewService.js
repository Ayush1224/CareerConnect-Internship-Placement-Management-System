import api from './api';

export const getMyInterviews = async () => {
  const response = await api.get('/interviews/mine');
  return response.data;
};

export const getCompanyInterviews = async (applicationId) => {
  const response = await api.get(`/interviews/application/${applicationId}`);
  return response.data;
};

export const scheduleInterview = async (payload, idempotencyKey) => {
  const response = await api.post('/interviews', payload, {
    headers: { 'Idempotency-Key': idempotencyKey }
  });
  return response.data;
};

export const rescheduleInterview = async (interviewId, payload, idempotencyKey) => {
  const response = await api.patch(`/interviews/${interviewId}/reschedule`, payload, {
    headers: { 'Idempotency-Key': idempotencyKey }
  });
  return response.data;
};

export const cancelInterview = async (interviewId, idempotencyKey) => {
  const response = await api.patch(`/interviews/${interviewId}/cancel`, {}, {
    headers: { 'Idempotency-Key': idempotencyKey }
  });
  return response.data;
};

export const completeInterview = async (interviewId) => {
  const response = await api.patch(`/interviews/${interviewId}/complete`);
  return response.data;
};

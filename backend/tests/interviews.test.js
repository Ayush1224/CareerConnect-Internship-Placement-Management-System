import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import app from '../server.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Interview from '../models/Interview.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

process.env.MONGO_DB_NAME = 'careerconnect_auth_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'careerconnect-interview-test-secret';

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const createdUserIds = [];
const createdCompanyIds = [];
const createdJobIds = [];
const createdApplicationIds = [];
let server;
let baseUrl;
let companyToken;
let secondCompanyToken;
let studentToken;
let secondStudentToken;
let company;
let secondCompany;
let student;
let secondStudent;
let shortlistedApplication;
let secondApplication;
let appliedApplication;

before(async () => {
  assert.notEqual(process.env.MONGO_DB_NAME, 'careerconnect');
  await connectDB();
  assert.equal(mongoose.connection.name, 'careerconnect_auth_test');
  await Promise.all([
    User.init(),
    Company.init(),
    Job.init(),
    Application.init(),
    Interview.init(),
    Notification.init()
  ]);

  const indexes = await Notification.collection.indexes();
  assert.ok(indexes.some((index) => (
    index.unique
    && index.key.dedupeKey === 1
    && index.partialFilterExpression?.dedupeKey?.$type === 'string'
  )), 'Notification idempotency key must be unique when present');

  const [companyUser, secondCompanyUser, studentUser, secondStudentUser] = await Promise.all([
    User.create({ name: 'Interview Test Company', email: `interview-company-${suffix}@example.com`, password: 'TestPassword!234', role: 'company' }),
    User.create({ name: 'Interview Test Other Company', email: `interview-company-other-${suffix}@example.com`, password: 'TestPassword!234', role: 'company' }),
    User.create({ name: 'Interview Test Student', email: `interview-student-${suffix}@example.com`, password: 'TestPassword!234', role: 'student' }),
    User.create({ name: 'Interview Test Other Student', email: `interview-student-other-${suffix}@example.com`, password: 'TestPassword!234', role: 'student' })
  ]);
  createdUserIds.push(companyUser._id, secondCompanyUser._id, studentUser._id, secondStudentUser._id);
  companyToken = generateToken(companyUser._id);
  secondCompanyToken = generateToken(secondCompanyUser._id);
  studentToken = generateToken(studentUser._id);
  secondStudentToken = generateToken(secondStudentUser._id);
  student = studentUser;
  secondStudent = secondStudentUser;

  [company, secondCompany] = await Promise.all([
    Company.create({ userId: companyUser._id, companyName: 'Interview Test Company' }),
    Company.create({ userId: secondCompanyUser._id, companyName: 'Interview Test Other Company' })
  ]);
  createdCompanyIds.push(company._id, secondCompany._id);

  const [closedJob, otherJob, pendingJob] = await Promise.all([
    Job.create({ companyId: company._id, title: 'Closed Test Role', description: 'Closed roles retain applicants.', status: 'Closed' }),
    Job.create({ companyId: company._id, title: 'Second Test Role', description: 'Multiple rounds are supported.', status: 'Active' }),
    Job.create({ companyId: company._id, title: 'Pending Test Role', description: 'Not shortlisted.', status: 'Active' })
  ]);
  createdJobIds.push(closedJob._id, otherJob._id, pendingJob._id);

  [shortlistedApplication, secondApplication, appliedApplication] = await Promise.all([
    Application.create({
      studentId: student._id,
      jobId: closedJob._id,
      companyId: company._id,
      status: 'Shortlisted'
    }),
    Application.create({
      studentId: secondStudent._id,
      jobId: otherJob._id,
      companyId: company._id,
      status: 'Shortlisted'
    }),
    Application.create({
      studentId: student._id,
      jobId: pendingJob._id,
      companyId: company._id,
      status: 'Applied'
    })
  ]);
  createdApplicationIds.push(shortlistedApplication._id, secondApplication._id, appliedApplication._id);

  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
  if (mongoose.connection.readyState !== 0) {
    try {
      if (createdUserIds.length) {
        await Notification.deleteMany({ userId: { $in: createdUserIds } });
      }
      if (createdApplicationIds.length) {
        await Interview.deleteMany({ applicationId: { $in: createdApplicationIds } });
        await Application.deleteMany({ _id: { $in: createdApplicationIds } });
      }
      if (createdJobIds.length) {
        await Job.deleteMany({ _id: { $in: createdJobIds } });
      }
      if (createdCompanyIds.length) {
        await Company.deleteMany({ _id: { $in: createdCompanyIds } });
      }
      if (createdUserIds.length) {
        await User.deleteMany({ _id: { $in: createdUserIds } });
      }
    } finally {
      await mongoose.disconnect();
    }
  }
});

const request = async (path, { method = 'GET', token, body, headers = {} } = {}) => {
  const requestHeaders = { ...headers };
  if (token) requestHeaders.Authorization = `Bearer ${token}`;
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json';
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: requestHeaders,
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
};

const withKey = (key) => ({ 'Idempotency-Key': key });
const futureTime = (minutes = 30) => new Date(Date.now() + minutes * 60 * 1000).toISOString();

test('company schedules, retries, reschedules, cancels and completes interviews with owned access', async () => {
  const scheduleKey = `schedule-${suffix}`;
  const firstTime = futureTime();
  const scheduledResponse = await request('/interviews', {
    method: 'POST',
    token: companyToken,
    headers: withKey(scheduleKey),
    body: {
      applicationId: shortlistedApplication._id,
      scheduledAt: firstTime,
      meetingLink: 'https://meet.example.test/room/one',
      studentId: secondStudent._id,
      companyId: secondCompany._id,
      status: 'Completed'
    }
  });
  assert.equal(scheduledResponse.status, 201);
  const scheduled = (await scheduledResponse.json()).data.interview;
  assert.equal(scheduled.studentId, String(student._id));
  assert.equal(scheduled.companyId, String(company._id));
  assert.equal(scheduled.status, 'Scheduled');
  assert.equal(String(scheduled.applicationId), String(shortlistedApplication._id));

  const duplicateSchedule = await request('/interviews', {
    method: 'POST',
    token: companyToken,
    headers: withKey(scheduleKey),
    body: {
      applicationId: shortlistedApplication._id,
      scheduledAt: futureTime(90),
      meetingLink: 'https://meet.example.test/room/ignored'
    }
  });
  assert.equal(duplicateSchedule.status, 200);
  assert.equal((await duplicateSchedule.json()).data.interview._id, scheduled._id);
  assert.equal(await Interview.countDocuments({ applicationId: shortlistedApplication._id }), 1);
  assert.equal(await Notification.countDocuments({ userId: student._id }), 1);

  const simultaneousKey = `simultaneous-${suffix}`;
  const simultaneousSchedules = await Promise.all([
    request('/interviews', {
      method: 'POST',
      token: companyToken,
      headers: withKey(simultaneousKey),
      body: { applicationId: secondApplication._id, scheduledAt: futureTime(60) }
    }),
    request('/interviews', {
      method: 'POST',
      token: companyToken,
      headers: withKey(simultaneousKey),
      body: { applicationId: secondApplication._id, scheduledAt: futureTime(60) }
    })
  ]);
  assert.deepEqual(
    simultaneousSchedules.map((response) => response.status).sort(),
    [200, 201]
  );
  assert.equal(await Interview.countDocuments({ applicationId: secondApplication._id }), 1);
  assert.equal(await Notification.countDocuments({ userId: secondStudent._id }), 1);

  const rescheduleKey = `reschedule-${suffix}`;
  const rescheduledAt = futureTime(120);
  const rescheduleResponse = await request(`/interviews/${scheduled._id}/reschedule`, {
    method: 'PATCH',
    token: companyToken,
    headers: withKey(rescheduleKey),
    body: { scheduledAt: rescheduledAt, meetingLink: 'https://meet.example.test/room/two' }
  });
  assert.equal(rescheduleResponse.status, 200);
  assert.equal(new Date((await rescheduleResponse.json()).data.interview.scheduledAt).toISOString(), rescheduledAt);
  const duplicateReschedule = await request(`/interviews/${scheduled._id}/reschedule`, {
    method: 'PATCH',
    token: companyToken,
    headers: withKey(rescheduleKey),
    body: { scheduledAt: futureTime(180) }
  });
  assert.equal(duplicateReschedule.status, 200);
  assert.equal(
    new Date((await duplicateReschedule.json()).data.interview.scheduledAt).toISOString(),
    rescheduledAt
  );
  assert.equal(await Notification.countDocuments({ userId: student._id }), 2);

  const cancelKey = `cancel-${suffix}`;
  const cancelResponse = await request(`/interviews/${scheduled._id}/cancel`, {
    method: 'PATCH',
    token: companyToken,
    headers: withKey(cancelKey)
  });
  assert.equal(cancelResponse.status, 200);
  assert.equal((await cancelResponse.json()).data.interview.status, 'Cancelled');
  const duplicateCancel = await request(`/interviews/${scheduled._id}/cancel`, {
    method: 'PATCH',
    token: companyToken,
    headers: withKey(cancelKey)
  });
  assert.equal(duplicateCancel.status, 200);
  assert.equal(await Notification.countDocuments({ userId: student._id }), 3);

  const secondRound = await request('/interviews', {
    method: 'POST',
    token: companyToken,
    headers: withKey(`round-two-${suffix}`),
    body: { applicationId: shortlistedApplication._id, scheduledAt: futureTime(240) }
  });
  assert.equal(secondRound.status, 201);
  const secondRoundInterview = (await secondRound.json()).data.interview;
  assert.equal(await Interview.countDocuments({ applicationId: shortlistedApplication._id }), 2);

  const completeResponse = await request(`/interviews/${secondRoundInterview._id}/complete`, {
    method: 'PATCH',
    token: companyToken
  });
  assert.equal(completeResponse.status, 200);
  assert.equal((await completeResponse.json()).data.interview.status, 'Completed');
  assert.equal((await Application.findById(shortlistedApplication._id)).status, 'Shortlisted');

  const companyList = await request(`/interviews/application/${shortlistedApplication._id}`, {
    token: companyToken
  });
  assert.equal(companyList.status, 200);
  assert.equal((await companyList.json()).data.interviews.length, 2);

  const studentList = await request('/interviews/mine', { token: studentToken });
  assert.equal(studentList.status, 200);
  const studentInterviews = (await studentList.json()).data.interviews;
  assert.equal(studentInterviews.length, 2);
  assert.equal(studentInterviews[0].jobTitle, 'Closed Test Role');
  assert.equal(studentInterviews[0].company, company.companyName);
  assert.ok(studentInterviews.some((interview) => interview.status === 'Cancelled'));

  const otherStudentRead = await request(`/interviews/${scheduled._id}`, { token: secondStudentToken });
  assert.equal(otherStudentRead.status, 404);
  const otherCompanyRead = await request(`/interviews/${scheduled._id}`, { token: secondCompanyToken });
  assert.equal(otherCompanyRead.status, 404);
  const otherCompanyList = await request(`/interviews/application/${shortlistedApplication._id}`, {
    token: secondCompanyToken
  });
  assert.equal(otherCompanyList.status, 404);
  const otherCompanyReschedule = await request(`/interviews/${scheduled._id}/reschedule`, {
    method: 'PATCH',
    token: secondCompanyToken,
    headers: withKey(`unauthorized-reschedule-${suffix}`),
    body: { scheduledAt: futureTime(300) }
  });
  assert.equal(otherCompanyReschedule.status, 404);
  const otherCompanyCancel = await request(`/interviews/${scheduled._id}/cancel`, {
    method: 'PATCH',
    token: secondCompanyToken,
    headers: withKey(`unauthorized-cancel-${suffix}`)
  });
  assert.equal(otherCompanyCancel.status, 404);
  const otherCompanyComplete = await request(`/interviews/${scheduled._id}/complete`, {
    method: 'PATCH',
    token: secondCompanyToken
  });
  assert.equal(otherCompanyComplete.status, 404);

  const unshortlisted = await request('/interviews', {
    method: 'POST',
    token: companyToken,
    headers: withKey(`not-shortlisted-${suffix}`),
    body: { applicationId: appliedApplication._id, scheduledAt: futureTime() }
  });
  assert.equal(unshortlisted.status, 409);

  const studentSchedule = await request('/interviews', {
    method: 'POST',
    token: studentToken,
    headers: withKey(`student-schedule-${suffix}`),
    body: { applicationId: shortlistedApplication._id, scheduledAt: futureTime() }
  });
  assert.equal(studentSchedule.status, 403);
  const companyStudentList = await request('/interviews/mine', { token: companyToken });
  assert.equal(companyStudentList.status, 403);
});

test('interview validation and notification read state are enforced', async () => {
  const invalidDate = await request('/interviews', {
    method: 'POST',
    token: companyToken,
    headers: withKey(`invalid-date-${suffix}`),
    body: { applicationId: shortlistedApplication._id, scheduledAt: '2020-01-01T10:00:00' }
  });
  assert.equal(invalidDate.status, 400);

  const missingTimezone = await request('/interviews', {
    method: 'POST',
    token: companyToken,
    headers: withKey(`no-timezone-${suffix}`),
    body: { applicationId: shortlistedApplication._id, scheduledAt: '2099-01-01T10:00:00' }
  });
  assert.equal(missingTimezone.status, 400);

  const invalidLink = await request('/interviews', {
    method: 'POST',
    token: companyToken,
    headers: withKey(`invalid-link-${suffix}`),
    body: {
      applicationId: shortlistedApplication._id,
      scheduledAt: futureTime(),
      meetingLink: 'javascript:alert(1)'
    }
  });
  assert.equal(invalidLink.status, 400);

  const unsupportedLink = await request('/interviews', {
    method: 'POST',
    token: companyToken,
    headers: withKey(`http-link-${suffix}`),
    body: {
      applicationId: shortlistedApplication._id,
      scheduledAt: futureTime(),
      meetingLink: 'http://meet.example.test/room'
    }
  });
  assert.equal(unsupportedLink.status, 400);

  const studentNotifications = await request('/notifications', { token: studentToken });
  assert.equal(studentNotifications.status, 200);
  const notificationData = (await studentNotifications.json()).data;
  assert.equal(notificationData.unreadCount, 4);
  const unreadNotification = notificationData.notifications.find((notification) => !notification.isRead);
  assert.ok(unreadNotification);

  const markRead = await request(`/notifications/${unreadNotification._id}/read`, {
    method: 'PATCH',
    token: studentToken
  });
  assert.equal(markRead.status, 200);
  assert.equal((await markRead.json()).data.notification.isRead, true);
  const afterRead = await request('/notifications', { token: studentToken });
  assert.equal((await afterRead.json()).data.unreadCount, 3);

  const crossStudentRead = await request(`/notifications/${unreadNotification._id}/read`, {
    method: 'PATCH',
    token: secondStudentToken
  });
  assert.equal(crossStudentRead.status, 404);
  const otherStudentNotifications = await request('/notifications', { token: secondStudentToken });
  assert.equal((await otherStudentNotifications.json()).data.unreadCount, 1);
});

test('interview and notification changes roll back together when notification persistence fails', async () => {
  const beforeInterviewCount = await Interview.countDocuments({ applicationId: secondApplication._id });
  const beforeNotificationCount = await Notification.countDocuments({ userId: secondStudent._id });
  const originalCreate = Notification.create;
  try {
    Notification.create = async () => {
      throw new Error('Injected notification write failure');
    };
    const failedSchedule = await request('/interviews', {
      method: 'POST',
      token: companyToken,
      headers: withKey(`rollback-schedule-${suffix}`),
      body: { applicationId: secondApplication._id, scheduledAt: futureTime() }
    });
    assert.equal(failedSchedule.status, 500);
  } finally {
    Notification.create = originalCreate;
  }
  assert.equal(await Interview.countDocuments({ applicationId: secondApplication._id }), beforeInterviewCount);
  assert.equal(await Notification.countDocuments({ userId: secondStudent._id }), beforeNotificationCount);

  const scheduled = await request('/interviews', {
    method: 'POST',
    token: companyToken,
    headers: withKey(`rollback-seed-${suffix}`),
    body: { applicationId: secondApplication._id, scheduledAt: futureTime(30) }
  });
  assert.equal(scheduled.status, 201);
  const interview = (await scheduled.json()).data.interview;
  const originalScheduledAt = new Date(interview.scheduledAt).toISOString();
  const originalCreateForReschedule = Notification.create;
  try {
    Notification.create = async () => {
      throw new Error('Injected notification write failure');
    };
    const failedReschedule = await request(`/interviews/${interview._id}/reschedule`, {
      method: 'PATCH',
      token: companyToken,
      headers: withKey(`rollback-reschedule-${suffix}`),
      body: { scheduledAt: futureTime(120) }
    });
    assert.equal(failedReschedule.status, 500);
  } finally {
    Notification.create = originalCreateForReschedule;
  }
  const unchanged = await Interview.findById(interview._id);
  assert.equal(unchanged.status, 'Scheduled');
  assert.equal(unchanged.scheduledAt.toISOString(), originalScheduledAt);

  const beforeCancelNotificationCount = await Notification.countDocuments({ userId: secondStudent._id });
  const originalCreateForCancel = Notification.create;
  try {
    Notification.create = async () => {
      throw new Error('Injected notification write failure');
    };
    const failedCancel = await request(`/interviews/${interview._id}/cancel`, {
      method: 'PATCH',
      token: companyToken,
      headers: withKey(`rollback-cancel-${suffix}`)
    });
    assert.equal(failedCancel.status, 500);
  } finally {
    Notification.create = originalCreateForCancel;
  }
  const unchangedAfterCancel = await Interview.findById(interview._id);
  assert.equal(unchangedAfterCancel.status, 'Scheduled');
  assert.equal(await Notification.countDocuments({ userId: secondStudent._id }), beforeCancelNotificationCount);
});

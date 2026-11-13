import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import app from '../server.js';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

process.env.MONGO_DB_NAME = 'careerconnect_auth_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'careerconnect-application-test-secret';

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const createdUserIds = [];
const createdCompanyIds = [];
const createdJobIds = [];
let server;
let baseUrl;
let ownerToken;
let secondCompanyToken;
let studentToken;
let secondStudentToken;
let ownerCompany;
let secondCompany;
let student;
let secondStudent;
let activeJob;
let raceJob;
let draftJob;
let closedJob;
let expiredJob;

before(async () => {
  assert.notEqual(process.env.MONGO_DB_NAME, 'careerconnect');
  await connectDB();
  assert.equal(mongoose.connection.name, 'careerconnect_auth_test');
  await Promise.all([
    User.init(),
    Company.init(),
    StudentProfile.init(),
    Job.init(),
    Application.init()
  ]);

  const indexes = await Application.collection.indexes();
  assert.ok(indexes.some((index) => (
    index.unique
    && index.key.studentId === 1
    && index.key.jobId === 1
  )), 'Application studentId + jobId unique index must exist');

  const [owner, secondCompanyUser, firstStudent, secondStudentUser] = await Promise.all([
    User.create({ name: 'Application Test Owner', email: `application-owner-${suffix}@example.com`, password: 'TestPassword!234', role: 'company' }),
    User.create({ name: 'Application Test Other Company', email: `application-company-${suffix}@example.com`, password: 'TestPassword!234', role: 'company' }),
    User.create({ name: 'Application Test Student', email: `application-student-${suffix}@example.com`, password: 'TestPassword!234', role: 'student' }),
    User.create({ name: 'Application Test Other Student', email: `application-student-other-${suffix}@example.com`, password: 'TestPassword!234', role: 'student' })
  ]);
  createdUserIds.push(owner._id, secondCompanyUser._id, firstStudent._id, secondStudentUser._id);
  ownerToken = generateToken(owner._id);
  secondCompanyToken = generateToken(secondCompanyUser._id);
  studentToken = generateToken(firstStudent._id);
  secondStudentToken = generateToken(secondStudentUser._id);
  student = firstStudent;
  secondStudent = secondStudentUser;

  [ownerCompany, secondCompany] = await Promise.all([
    Company.create({ userId: owner._id, companyName: 'Application Test Company' }),
    Company.create({ userId: secondCompanyUser._id, companyName: 'Application Test Other Company' })
  ]);
  createdCompanyIds.push(ownerCompany._id, secondCompany._id);

  await StudentProfile.create({
    userId: student._id,
    college: 'Test University',
    degree: 'B.Tech',
    branch: 'Computer Science',
    graduationYear: 2027,
    skills: ['React', 'Node.js'],
    resume: 'https://example.test/resumes/application-test.pdf'
  });

  const futureDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
  [activeJob, raceJob, draftJob, closedJob, expiredJob] = await Promise.all([
    Job.create({ companyId: ownerCompany._id, title: 'Application Test Active', description: 'Open role', location: 'Remote', applicationDeadline: futureDeadline, status: 'Active' }),
    Job.create({ companyId: ownerCompany._id, title: 'Application Test Race', description: 'Open role for race test', location: 'Remote', applicationDeadline: futureDeadline, status: 'Active' }),
    Job.create({ companyId: ownerCompany._id, title: 'Application Test Draft', description: 'Draft role', location: 'Remote', applicationDeadline: futureDeadline, status: 'Draft' }),
    Job.create({ companyId: ownerCompany._id, title: 'Application Test Closed', description: 'Closed role', location: 'Remote', applicationDeadline: futureDeadline, status: 'Closed' }),
    Job.create({ companyId: ownerCompany._id, title: 'Application Test Expired', description: 'Expired role', location: 'Remote', applicationDeadline: new Date(Date.now() - 1000), status: 'Active' })
  ]);
  createdJobIds.push(activeJob._id, raceJob._id, draftJob._id, closedJob._id, expiredJob._id);

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
      if (createdJobIds.length) {
        await Application.deleteMany({ jobId: { $in: createdJobIds } });
        await Job.deleteMany({ _id: { $in: createdJobIds } });
      }
      if (createdCompanyIds.length) {
        await Application.deleteMany({ companyId: { $in: createdCompanyIds } });
        await Company.deleteMany({ _id: { $in: createdCompanyIds } });
      }
      if (createdUserIds.length) {
        await Application.deleteMany({ studentId: { $in: createdUserIds } });
        await StudentProfile.deleteMany({ userId: { $in: createdUserIds } });
        await User.deleteMany({ _id: { $in: createdUserIds } });
      }
    } finally {
      await mongoose.disconnect();
    }
  }
});

const request = async (path, { method = 'GET', token, body } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(`${baseUrl}${path}`, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
};

test('student applications, duplicate protection, and company applicant review enforce ownership', async () => {
  const firstSubmission = await request('/applications', {
    method: 'POST',
    token: studentToken,
    body: {
      jobId: activeJob._id,
      coverLetter: 'I am interested in this role.',
      studentId: secondStudent._id,
      companyId: secondCompany._id,
      status: 'Selected'
    }
  });
  assert.equal(firstSubmission.status, 201);
  const application = (await firstSubmission.json()).data.application;
  assert.equal(application.studentId, String(student._id));
  assert.equal(application.companyId, String(ownerCompany._id));
  assert.equal(application.status, 'Applied');
  assert.equal(application.resume, 'https://example.test/resumes/application-test.pdf');
  assert.equal(application.coverLetter, 'I am interested in this role.');

  const duplicateSubmission = await request('/applications', {
    method: 'POST',
    token: studentToken,
    body: { jobId: activeJob._id }
  });
  assert.equal(duplicateSubmission.status, 409);

  const otherStudentSubmission = await request('/applications', {
    method: 'POST',
    token: secondStudentToken,
    body: { jobId: activeJob._id }
  });
  assert.equal(otherStudentSubmission.status, 201);
  const otherApplication = (await otherStudentSubmission.json()).data.application;

  const simultaneousSubmissions = await Promise.all([
    request('/applications', { method: 'POST', token: studentToken, body: { jobId: raceJob._id } }),
    request('/applications', { method: 'POST', token: studentToken, body: { jobId: raceJob._id } })
  ]);
  assert.deepEqual(simultaneousSubmissions.map((response) => response.status).sort(), [201, 409]);

  const companyApply = await request('/applications', {
    method: 'POST',
    token: ownerToken,
    body: { jobId: activeJob._id }
  });
  assert.equal(companyApply.status, 403);

  for (const unavailableJob of [draftJob, closedJob, expiredJob]) {
    const response = await request('/applications', {
      method: 'POST',
      token: studentToken,
      body: { jobId: unavailableJob._id }
    });
    assert.equal(response.status, 409);
  }

  const ownApplications = await request('/applications', { token: studentToken });
  assert.equal(ownApplications.status, 200);
  const studentApplications = (await ownApplications.json()).data.applications;
  assert.ok(studentApplications.some((item) => item._id === String(application._id)));
  assert.equal(studentApplications.some((item) => item._id === String(otherApplication._id)), false);
  assert.equal(studentApplications.find((item) => item._id === String(application._id)).jobTitle, activeJob.title);
  assert.equal(studentApplications.find((item) => item._id === String(application._id)).company, ownerCompany.companyName);

  const otherStudentApplication = await request(`/applications/${otherApplication._id}`, { token: studentToken });
  assert.equal(otherStudentApplication.status, 404);
  const ownApplication = await request(`/applications/${application._id}`, { token: studentToken });
  assert.equal(ownApplication.status, 200);

  const invalidStatus = await request(`/applications/${application._id}/status`, {
    method: 'PATCH',
    token: ownerToken,
    body: { status: 'Interviewing' }
  });
  assert.equal(invalidStatus.status, 400);

  const shortlist = await request(`/applications/${application._id}/status`, {
    method: 'PATCH',
    token: ownerToken,
    body: { status: 'Shortlisted' }
  });
  assert.equal(shortlist.status, 200);
  assert.equal((await shortlist.json()).data.application.status, 'Shortlisted');

  const otherCompanyRead = await request(`/applications/jobs/${activeJob._id}`, { token: secondCompanyToken });
  assert.equal(otherCompanyRead.status, 404);
  const otherCompanyUpdate = await request(`/applications/${application._id}/status`, {
    method: 'PATCH',
    token: secondCompanyToken,
    body: { status: 'Rejected' }
  });
  assert.equal(otherCompanyUpdate.status, 404);

  const closeJob = await request(`/jobs/${activeJob._id}/close`, {
    method: 'PATCH',
    token: ownerToken
  });
  assert.equal(closeJob.status, 200);

  const closedJobApplicants = await request(`/applications/jobs/${activeJob._id}`, { token: ownerToken });
  assert.equal(closedJobApplicants.status, 200);
  const reviewedApplications = (await closedJobApplicants.json()).data.applications;
  assert.equal(reviewedApplications.length, 2);
  assert.ok(reviewedApplications.some((item) => item._id === String(application._id) && item.status === 'Shortlisted'));

  const updatedOwnApplications = await request('/applications', { token: studentToken });
  const updatedList = (await updatedOwnApplications.json()).data.applications;
  assert.equal(updatedList.find((item) => item._id === String(application._id)).status, 'Shortlisted');

  const sameDayJobResponse = await request('/jobs', {
    method: 'POST',
    token: ownerToken,
    body: {
      title: 'Application Test Same Day Deadline',
      description: 'A date-only deadline that remains open for its calendar date.',
      location: 'Remote',
      vacancies: 1,
      applicationDeadline: new Date().toISOString().slice(0, 10),
      status: 'Active'
    }
  });
  assert.equal(sameDayJobResponse.status, 201);
  const sameDayJob = (await sameDayJobResponse.json()).data.job;
  createdJobIds.push(sameDayJob._id);
  const publicJobs = await request('/jobs');
  assert.ok((await publicJobs.json()).data.jobs.some((job) => job._id === sameDayJob._id));
  const sameDayApplication = await request('/applications', {
    method: 'POST',
    token: studentToken,
    body: { jobId: sameDayJob._id }
  });
  assert.equal(sameDayApplication.status, 201);
});

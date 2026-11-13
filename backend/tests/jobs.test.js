import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import app from '../server.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

process.env.MONGO_DB_NAME = 'careerconnect_auth_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'careerconnect-job-test-secret';

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const ownerEmail = `job-owner-${suffix}@example.com`;
const secondCompanyEmail = `job-second-${suffix}@example.com`;
const studentEmail = `job-student-${suffix}@example.com`;
const createdUserIds = [];
const createdCompanyIds = [];
let server;
let baseUrl;
let ownerToken;
let secondCompanyToken;
let studentToken;

before(async () => {
  assert.notEqual(process.env.MONGO_DB_NAME, 'careerconnect');
  await connectDB();
  assert.equal(mongoose.connection.name, 'careerconnect_auth_test');
  await Promise.all([User.init(), Company.init(), Job.init()]);

  const [owner, secondCompany, student] = await Promise.all([
    User.create({ name: 'Job Test Owner', email: ownerEmail, password: 'TestPassword!234', role: 'company' }),
    User.create({ name: 'Job Test Second Company', email: secondCompanyEmail, password: 'TestPassword!234', role: 'company' }),
    User.create({ name: 'Job Test Student', email: studentEmail, password: 'TestPassword!234', role: 'student' })
  ]);
  createdUserIds.push(owner._id, secondCompany._id, student._id);
  ownerToken = generateToken(owner._id);
  secondCompanyToken = generateToken(secondCompany._id);
  studentToken = generateToken(student._id);

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
      if (createdCompanyIds.length) {
        await Job.deleteMany({ companyId: { $in: createdCompanyIds } });
      }
      if (createdUserIds.length) {
        await Company.deleteMany({ userId: { $in: createdUserIds } });
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

test('company profiles and owned job lifecycle enforce visibility and access', async () => {
  const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const expiredDeadline = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const missingProfilePost = await request('/jobs', {
    method: 'POST',
    token: ownerToken,
    body: {
      title: 'Profile Required Role',
      description: 'This posting must require company setup.',
      location: 'Remote',
      vacancies: 1
    }
  });
  assert.equal(missingProfilePost.status, 400);

  const ownerProfile = await request('/companies/me', {
    method: 'PUT',
    token: ownerToken,
    body: { companyName: 'Job Test Company', contactEmail: ownerEmail }
  });
  assert.equal(ownerProfile.status, 200);
  const ownerCompany = (await ownerProfile.json()).data.company;
  createdCompanyIds.push(ownerCompany._id);

  const secondProfile = await request('/companies/me', {
    method: 'PUT',
    token: secondCompanyToken,
    body: { companyName: 'Second Job Test Company', contactEmail: secondCompanyEmail }
  });
  assert.equal(secondProfile.status, 200);
  createdCompanyIds.push((await secondProfile.json()).data.company._id);

  const publishedResponse = await request('/jobs', {
    method: 'POST',
    token: ownerToken,
    body: {
      title: 'Published Test Role',
      description: 'A visible job for isolated API tests.',
      location: 'Remote',
      jobType: 'Internship',
      vacancies: 2,
      applicationDeadline: futureDeadline,
      skillsRequired: ['React', 'Node.js']
    }
  });
  assert.equal(publishedResponse.status, 201);
  const published = (await publishedResponse.json()).data.job;
  assert.equal(published.companyId, ownerCompany._id);

  const ownerJobsResponse = await request('/jobs/mine', { token: ownerToken });
  assert.equal(ownerJobsResponse.status, 200);
  assert.ok((await ownerJobsResponse.json()).data.jobs.some((job) => job._id === published._id));
  const secondJobsResponse = await request('/jobs/mine', { token: secondCompanyToken });
  assert.deepEqual((await secondJobsResponse.json()).data.jobs, []);

  const studentJobsResponse = await request('/jobs');
  assert.equal(studentJobsResponse.status, 200);
  const studentJobs = (await studentJobsResponse.json()).data.jobs;
  assert.ok(studentJobs.some((job) => job._id === published._id));
  const publishedDetail = await request(`/jobs/${published._id}`);
  assert.equal(publishedDetail.status, 200);

  const studentCreate = await request('/jobs', {
    method: 'POST',
    token: studentToken,
    body: {
      title: 'Unauthorized Test Role',
      description: 'Students cannot publish jobs.',
      location: 'Remote',
      vacancies: 1
    }
  });
  assert.equal(studentCreate.status, 403);
  const studentEdit = await request(`/jobs/${published._id}`, {
    method: 'PATCH',
    token: studentToken,
    body: { title: 'Unauthorized edit' }
  });
  assert.equal(studentEdit.status, 403);

  const invalidStatus = await request(`/jobs/${published._id}`, {
    method: 'PATCH',
    token: ownerToken,
    body: { status: 'Archived' }
  });
  assert.equal(invalidStatus.status, 400);

  const draftResponse = await request('/jobs', {
    method: 'POST',
    token: ownerToken,
    body: {
      title: 'Draft Test Role',
      description: 'A draft job hidden from students.',
      location: 'Remote',
      vacancies: 1,
      applicationDeadline: futureDeadline,
      status: 'Draft'
    }
  });
  assert.equal(draftResponse.status, 201);
  const draft = (await draftResponse.json()).data.job;

  const closedResponse = await request('/jobs', {
    method: 'POST',
    token: ownerToken,
    body: {
      title: 'Closed Test Role',
      description: 'A closed job hidden from students.',
      location: 'Remote',
      vacancies: 1,
      applicationDeadline: futureDeadline,
      status: 'Closed'
    }
  });
  assert.equal(closedResponse.status, 201);
  const closed = (await closedResponse.json()).data.job;

  const expiredResponse = await request('/jobs', {
    method: 'POST',
    token: ownerToken,
    body: {
      title: 'Expired Test Role',
      description: 'An expired job hidden from students.',
      location: 'Remote',
      vacancies: 1,
      applicationDeadline: expiredDeadline
    }
  });
  assert.equal(expiredResponse.status, 201);
  const expired = (await expiredResponse.json()).data.job;

  for (const hiddenJob of [draft, closed, expired]) {
    const detailResponse = await request(`/jobs/${hiddenJob._id}`);
    assert.equal(detailResponse.status, 404);
  }
  const visibleJobsResponse = await request('/jobs');
  const visibleJobs = (await visibleJobsResponse.json()).data.jobs;
  assert.ok(visibleJobs.some((job) => job._id === published._id));
  for (const hiddenJob of [draft, closed, expired]) {
    assert.equal(visibleJobs.some((job) => job._id === hiddenJob._id), false);
  }

  const secondCompanyEdit = await request(`/jobs/${published._id}`, {
    method: 'PATCH',
    token: secondCompanyToken,
    body: { title: 'Wrong owner edit' }
  });
  assert.equal(secondCompanyEdit.status, 404);
  const secondCompanyClose = await request(`/jobs/${published._id}/close`, {
    method: 'PATCH',
    token: secondCompanyToken
  });
  assert.equal(secondCompanyClose.status, 404);

  const ownerEdit = await request(`/jobs/${published._id}`, {
    method: 'PATCH',
    token: ownerToken,
    body: { title: 'Edited Test Role' }
  });
  assert.equal(ownerEdit.status, 200);
  assert.equal((await ownerEdit.json()).data.job.title, 'Edited Test Role');

  const ownerClose = await request(`/jobs/${published._id}/close`, {
    method: 'PATCH',
    token: ownerToken
  });
  assert.equal(ownerClose.status, 200);
  assert.equal((await ownerClose.json()).data.job.status, 'Closed');
  const closedDetail = await request(`/jobs/${published._id}`);
  assert.equal(closedDetail.status, 404);
});

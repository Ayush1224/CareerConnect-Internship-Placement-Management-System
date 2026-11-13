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
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { publicJobFilter } from '../utils/jobAvailability.js';

process.env.MONGO_DB_NAME = 'careerconnect_auth_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'careerconnect-admin-test-secret';

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const createdUserIds = [];
let company;
let activeJob;
let application;
let server;
let baseUrl;
let adminToken;
let companyToken;
let studentToken;
let baselineCounts;

before(async () => {
  assert.notEqual(process.env.MONGO_DB_NAME, 'careerconnect');
  await connectDB();
  assert.equal(mongoose.connection.name, 'careerconnect_auth_test');
  await Promise.all([
    User.init(),
    Company.init(),
    Job.init(),
    Application.init(),
    Interview.init()
  ]);

  const now = new Date();
  const [students, companies, activeJobs, applications, upcomingInterviews] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Company.countDocuments({}),
    Job.countDocuments(publicJobFilter(now)),
    Application.countDocuments({}),
    Interview.countDocuments({ status: 'Scheduled', scheduledAt: { $gt: now } })
  ]);
  baselineCounts = { students, companies, activeJobs, applications, upcomingInterviews };

  const [admin, companyUser, student] = await Promise.all([
    User.create({ name: 'Admin Test User', email: `admin-${suffix}@example.com`, password: 'TestPassword!234', role: 'admin' }),
    User.create({ name: 'Admin Test Company', email: `company-${suffix}@example.com`, password: 'TestPassword!234', role: 'company' }),
    User.create({ name: 'Admin Test Student', email: `student-${suffix}@example.com`, password: 'TestPassword!234', role: 'student' })
  ]);
  createdUserIds.push(admin._id, companyUser._id, student._id);
  adminToken = generateToken(admin._id);
  companyToken = generateToken(companyUser._id);
  studentToken = generateToken(student._id);
  company = await Company.create({
    userId: companyUser._id,
    companyName: `Admin Test Company ${suffix}`,
    industry: 'Software',
    location: 'Remote',
    verified: false
  });

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
      if (company) {
        await Interview.deleteMany({ companyId: company._id });
        await Application.deleteMany({ companyId: company._id });
        await Job.deleteMany({ companyId: company._id });
        await Company.deleteOne({ _id: company._id });
      }
      if (createdUserIds.length) {
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

test('admin APIs enforce roles, report accurate counts, and persist verification changes', async () => {
  const companyPost = await request('/jobs', {
    method: 'POST',
    token: companyToken,
    body: {
      title: 'Unverified Company Test Job',
      description: 'Verification remains informational.',
      location: 'Remote',
      vacancies: 1,
      applicationDeadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  });
  assert.equal(companyPost.status, 201);
  activeJob = (await companyPost.json()).data.job;

  await Promise.all([
    Job.create({
      companyId: company._id,
      title: 'Expired Admin Test Job',
      description: 'An expired active job is not counted as active.',
      status: 'Active',
      applicationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }),
    Job.create({
      companyId: company._id,
      title: 'Closed Admin Test Job',
      description: 'Closed jobs are not counted as active.',
      status: 'Closed'
    })
  ]);
  application = await Application.create({
    studentId: new mongoose.Types.ObjectId(createdUserIds[2]),
    jobId: activeJob._id,
    companyId: company._id
  });
  await Promise.all([
    Interview.create({
      applicationId: application._id,
      studentId: application.studentId,
      companyId: company._id,
      scheduledAt: new Date(Date.now() + 60 * 60 * 1000),
      status: 'Scheduled'
    }),
    Interview.create({
      applicationId: application._id,
      studentId: application.studentId,
      companyId: company._id,
      scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      status: 'Cancelled'
    }),
    Interview.create({
      applicationId: application._id,
      studentId: application.studentId,
      companyId: company._id,
      scheduledAt: new Date(Date.now() - 60 * 60 * 1000),
      status: 'Scheduled'
    })
  ]);

  assert.equal((await request('/admin/dashboard')).status, 401);
  const protectedPaths = [
    { path: '/admin/dashboard' },
    { path: '/admin/companies' },
    { path: `/admin/companies/${company._id}/verification`, method: 'PATCH', body: { verified: true } }
  ];
  for (const token of [studentToken, companyToken]) {
    for (const protectedPath of protectedPaths) {
      const response = await request(protectedPath.path, {
        ...protectedPath,
        token
      });
      assert.equal(response.status, 403);
    }
  }

  const dashboardResponse = await request('/admin/dashboard', { token: adminToken });
  assert.equal(dashboardResponse.status, 200);
  const dashboard = (await dashboardResponse.json()).data.counts;
  assert.deepEqual(dashboard, {
    students: baselineCounts.students + 1,
    companies: baselineCounts.companies + 1,
    activeJobs: baselineCounts.activeJobs + 1,
    applications: baselineCounts.applications + 1,
    upcomingInterviews: baselineCounts.upcomingInterviews + 1
  });

  const paginatedResponse = await request('/admin/companies?page=1&limit=1', { token: adminToken });
  assert.equal(paginatedResponse.status, 200);
  const paginated = (await paginatedResponse.json()).data;
  assert.equal(paginated.companies.length, 1);
  assert.equal(paginated.pagination.page, 1);
  assert.equal(paginated.pagination.limit, 1);
  assert.ok(paginated.pagination.total >= 1);

  const unverifiedResponse = await request('/admin/companies?verified=false&limit=100', { token: adminToken });
  const unverifiedCompanies = (await unverifiedResponse.json()).data.companies;
  const listedCompany = unverifiedCompanies.find((item) => item._id === String(company._id));
  assert.ok(listedCompany);
  assert.deepEqual(Object.keys(listedCompany).sort(), ['_id', 'companyName', 'industry', 'location', 'verified'].sort());

  const verifyResponse = await request(`/admin/companies/${company._id}/verification`, {
    method: 'PATCH',
    token: adminToken,
    body: { verified: true }
  });
  assert.equal(verifyResponse.status, 200);
  assert.equal((await Company.findById(company._id)).verified, true);

  const verifiedResponse = await request('/admin/companies?verified=true&limit=100', { token: adminToken });
  assert.ok((await verifiedResponse.json()).data.companies.some((item) => item._id === String(company._id)));

  const revokeResponse = await request(`/admin/companies/${company._id}/verification`, {
    method: 'PATCH',
    token: adminToken,
    body: { verified: false }
  });
  assert.equal(revokeResponse.status, 200);
  assert.equal((await Company.findById(company._id)).verified, false);

  assert.equal((await request('/admin/companies?page=0', { token: adminToken })).status, 400);
  assert.equal((await request('/admin/companies?verified=yes', { token: adminToken })).status, 400);
  assert.equal((await request('/admin/companies/not-an-id/verification', {
    method: 'PATCH',
    token: adminToken,
    body: { verified: true }
  })).status, 400);

  const adminSignup = await request('/auth/register', {
    method: 'POST',
    body: {
      name: 'Public Admin Registration',
      email: `public-admin-${suffix}@example.com`,
      password: 'TestPassword!234',
      role: 'admin'
    }
  });
  assert.equal(adminSignup.status, 400);
  assert.equal(await User.exists({ email: `public-admin-${suffix}@example.com` }), null);
});

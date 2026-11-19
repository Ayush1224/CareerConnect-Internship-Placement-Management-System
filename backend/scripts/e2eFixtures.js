import 'dotenv/config';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Application from '../models/Application.js';
import Company from '../models/Company.js';
import Interview from '../models/Interview.js';
import Job from '../models/Job.js';
import Notification from '../models/Notification.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import connectDB from '../config/db.js';

const e2eDatabaseName = 'careerconnect_e2e_test';
const passwords = {
  student: 'E2EPassword-Student!2026',
  recruiter: 'E2EPassword-Recruiter!2026',
  admin: 'E2EPassword-Admin!2026'
};
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.resolve(scriptDir, '..', '..', 'test-results', 'e2e-fixtures.json');

const cleanupRecords = async ({ userIds = [], companyId = null, companyUserId = null }) => {
  const applicationFilters = [];
  if (companyId) applicationFilters.push({ companyId });
  if (userIds.length) applicationFilters.push({ studentId: { $in: userIds } });
  const applicationIds = applicationFilters.length
    ? await Application.distinct('_id', { $or: applicationFilters })
    : [];
  const interviewIds = applicationIds.length
    ? await Interview.distinct('_id', { applicationId: { $in: applicationIds } })
    : [];

  if (userIds.length || interviewIds.length) {
    const notificationFilters = [];
    if (userIds.length) notificationFilters.push({ userId: { $in: userIds } });
    if (interviewIds.length) notificationFilters.push({ interviewId: { $in: interviewIds } });
    await Notification.deleteMany({ $or: notificationFilters });
  }
  if (interviewIds.length) await Interview.deleteMany({ _id: { $in: interviewIds } });
  if (applicationIds.length) await Application.deleteMany({ _id: { $in: applicationIds } });
  if (companyId) {
    await Job.deleteMany({ companyId });
    if (companyUserId) await Company.deleteOne({ _id: companyId, userId: companyUserId });
  }
  if (userIds.length) {
    await StudentProfile.deleteMany({ userId: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
  }
};

const setup = async () => {
  const runId = process.env.E2E_RUN_ID;
  assert.ok(runId, 'E2E_RUN_ID must be set by Playwright global setup.');
  assert.equal(process.env.MONGO_DB_NAME, e2eDatabaseName, 'Refusing to seed a non-E2E database.');
  await connectDB();
  assert.equal((await import('mongoose')).default.connection.name, e2eDatabaseName);

  const shortId = runId.slice(0, 8);
  const recruiterEmail = `recruiter-${runId}@example.test`;
  const adminEmail = `admin-${runId}@example.test`;
  const applicantEmail = `applicant-${runId}@example.test`;
  const studentEmail = `student-${runId}@example.test`;
  const createdUserIds = [];
  let companyId = null;
  let recruiterId = null;

  try {
    const [recruiter, applicant, admin] = await Promise.all([
      User.create({
        name: `E2E Recruiter ${shortId}`,
        email: recruiterEmail,
        password: passwords.recruiter,
        role: 'company'
      }),
      User.create({
        name: `E2E Applicant ${shortId}`,
        email: applicantEmail,
        password: passwords.student,
        role: 'student'
      }),
      User.create({
        name: `E2E Admin ${shortId}`,
        email: adminEmail,
        password: passwords.admin,
        role: 'admin'
      })
    ]);
    createdUserIds.push(recruiter._id, applicant._id, admin._id);
    recruiterId = recruiter._id;

    const company = await Company.create({
      userId: recruiter._id,
      companyName: `E2E Company ${shortId}`,
      website: 'https://e2e.example.test',
      industry: 'E2E Testing',
      location: 'E2E Remote',
      description: 'Company fixture created only for browser E2E tests.',
      contactEmail: recruiterEmail,
      verified: false
    });
    companyId = company._id;

    const browseJobTitle = `E2E Student Browse ${shortId}`;
    const reviewJobTitle = `E2E Applicant Review ${shortId}`;
    const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const [browseJob, reviewJob] = await Job.create([
      {
        companyId,
        title: browseJobTitle,
        description: 'A public job fixture for student application testing.',
        requirements: 'Browser E2E test data.',
        skillsRequired: ['React', 'Testing'],
        jobType: 'Internship',
        location: 'E2E Remote',
        vacancies: 1,
        applicationDeadline: deadline,
        status: 'Active'
      },
      {
        companyId,
        title: reviewJobTitle,
        description: 'An applicant review fixture for recruiter testing.',
        requirements: 'Browser E2E test data.',
        skillsRequired: ['Node.js'],
        jobType: 'Internship',
        location: 'E2E Remote',
        vacancies: 1,
        applicationDeadline: deadline,
        status: 'Active'
      }
    ]);

    await StudentProfile.create({
      userId: applicant._id,
      college: 'E2E University',
      degree: 'BSc',
      branch: 'Computer Science',
      graduationYear: 2027,
      skills: ['Node.js', 'Testing'],
      location: 'E2E Remote'
    });
    const application = await Application.create({
      studentId: applicant._id,
      jobId: reviewJob._id,
      companyId,
      coverLetter: 'Seeded only for recruiter applicant-review E2E.',
      status: 'Applied'
    });

    fs.mkdirSync(path.dirname(fixturePath), { recursive: true });
    fs.writeFileSync(fixturePath, JSON.stringify({
      runId,
      shortId,
      studentEmail,
      studentName: `E2E Student ${shortId}`,
      recruiterEmail,
      adminEmail,
      applicantEmail,
      companyName: company.companyName,
      companyId: String(company._id),
      recruiterId: String(recruiter._id),
      applicantId: String(applicant._id),
      adminId: String(admin._id),
      browseJobTitle,
      browseJobId: String(browseJob._id),
      reviewJobTitle,
      reviewJobId: String(reviewJob._id),
      applicationId: String(application._id)
    }, null, 2));
    console.log(`Seeded isolated browser E2E fixtures in "${e2eDatabaseName}".`);
  } catch (error) {
    await cleanupRecords({ userIds: createdUserIds, companyId, companyUserId: recruiterId });
    throw error;
  }
};

const cleanup = async () => {
  assert.equal(process.env.MONGO_DB_NAME, e2eDatabaseName, 'Refusing to clean a non-E2E database.');
  assert.ok(fs.existsSync(fixturePath), 'E2E fixture metadata was not found.');
  const fixtures = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
  await connectDB();
  assert.equal((await import('mongoose')).default.connection.name, e2eDatabaseName);

  const registeredStudent = await User.findOne({ email: fixtures.studentEmail }).select('_id');
  const userIds = [
    fixtures.recruiterId,
    fixtures.applicantId,
    fixtures.adminId,
    ...(registeredStudent ? [registeredStudent._id] : [])
  ];
  await cleanupRecords({
    userIds,
    companyId: fixtures.companyId,
    companyUserId: fixtures.recruiterId
  });
  console.log(`Removed browser E2E fixture records from "${e2eDatabaseName}".`);
};

try {
  const command = process.argv[2];
  if (command === 'setup') {
    await setup();
  } else if (command === 'cleanup') {
    await cleanup();
  } else {
    throw new Error('Expected command: setup or cleanup.');
  }
} finally {
  const mongoose = (await import('mongoose')).default;
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
}

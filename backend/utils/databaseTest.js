import 'dotenv/config';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import StudentProfile from '../models/StudentProfile.js';
import Company from '../models/Company.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import SavedJob from '../models/SavedJob.js';
import Notification from '../models/Notification.js';
import Interview from '../models/Interview.js';

const models = [User, StudentProfile, Company, Job, Application, SavedJob, Notification, Interview];
const created = new Map(models.map((Model) => [Model, []]));
const remember = (Model, document) => {
  created.get(Model).push(document._id);
  return document;
};

const testDatabase = async () => {
  await connectDB();

  try {
    assert.equal(mongoose.connection.name, 'careerconnect', 'Connected database must be careerconnect');
    assert.equal(models.length, 8, 'All eight models should import');
    await Promise.all(models.map((Model) => Model.init()));

    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const student = remember(User, await User.create({
      name: 'Database Test Student',
      email: `database-test-${suffix}@example.com`,
      password: 'TestPassword!234',
      role: 'student'
    }));
    assert.equal(await bcrypt.compare('TestPassword!234', student.password), true, 'User passwords should be hashed');
    assert.equal(student.toJSON().password, undefined, 'User JSON must not expose password hashes');

    const profile = remember(StudentProfile, await StudentProfile.create({
      userId: student._id,
      college: 'Test College',
      graduationYear: 2027
    }));
    const companyUser = remember(User, await User.create({
      name: 'Database Test Company',
      email: `database-company-${suffix}@example.com`,
      password: 'TestPassword!234',
      role: 'company'
    }));
    const company = remember(Company, await Company.create({
      userId: companyUser._id,
      companyName: `Test Company ${suffix}`,
      contactEmail: `contact-${suffix}@example.com`
    }));
    const job = remember(Job, await Job.create({
      companyId: company._id,
      title: 'Database Test Role',
      description: 'Isolated database test opening.',
      jobType: 'Internship',
      location: 'Remote',
      stipend: 1000,
      vacancies: 1,
      applicationDeadline: new Date('2027-12-31T00:00:00.000Z')
    }));
    const application = remember(Application, await Application.create({
      studentId: student._id,
      jobId: job._id,
      companyId: company._id
    }));
    const savedJob = remember(SavedJob, await SavedJob.create({
      studentId: student._id,
      jobId: job._id
    }));
    const notification = remember(Notification, await Notification.create({
      userId: student._id,
      title: 'Test notification',
      message: 'Isolated database test notification.',
      type: 'System'
    }));
    const interview = remember(Interview, await Interview.create({
      applicationId: application._id,
      studentId: student._id,
      companyId: company._id,
      scheduledAt: new Date('2027-01-15T10:00:00.000Z')
    }));

    assert.ok(await StudentProfile.findById(profile._id));
    assert.ok(await SavedJob.findById(savedJob._id));
    assert.ok(await Notification.findById(notification._id));
    assert.ok(await Interview.findById(interview._id));

    const populatedStudent = await User.findById(student._id)
      .populate('studentProfile')
      .populate('applications')
      .populate('savedJobs')
      .populate('notifications');
    assert.equal(populatedStudent.studentProfile._id.toString(), profile._id.toString());
    assert.equal(populatedStudent.applications[0]._id.toString(), application._id.toString());
    assert.equal(populatedStudent.savedJobs[0]._id.toString(), savedJob._id.toString());
    assert.equal(populatedStudent.notifications[0]._id.toString(), notification._id.toString());

    const populatedApplication = await Application.findById(application._id)
      .populate('studentId')
      .populate({ path: 'jobId', populate: { path: 'companyId' } })
      .populate('companyId')
      .populate('interviews');
    assert.equal(populatedApplication.studentId._id.toString(), student._id.toString());
    assert.equal(populatedApplication.jobId.companyId._id.toString(), company._id.toString());
    assert.equal(populatedApplication.interviews[0]._id.toString(), interview._id.toString());

    const populatedCompany = await Company.findById(company._id).populate('jobs');
    assert.equal(populatedCompany.jobs[0]._id.toString(), job._id.toString());

    let duplicateApplication;
    try {
      duplicateApplication = await Application.create({
        studentId: student._id,
        jobId: job._id,
        companyId: company._id
      });
    } catch (error) {
      assert.equal(error.code, 11000, 'Application compound index should reject duplicate student/job pairs');
    }
    if (duplicateApplication) {
      remember(Application, duplicateApplication);
      assert.fail('Duplicate application was accepted');
    }

    let duplicateSavedJob;
    try {
      duplicateSavedJob = await SavedJob.create({ studentId: student._id, jobId: job._id });
    } catch (error) {
      assert.equal(error.code, 11000, 'Saved-job compound index should reject duplicate student/job pairs');
    }
    if (duplicateSavedJob) {
      remember(SavedJob, duplicateSavedJob);
      assert.fail('Duplicate saved job was accepted');
    }

    console.log('Database tests passed: connection, database name, model imports, CRUD, references, populate, and unique indexes.');
  } finally {
    try {
      for (const Model of [Interview, Notification, SavedJob, Application, Job, Company, StudentProfile, User]) {
        const ids = created.get(Model);
        if (ids.length > 0) {
          await Model.deleteMany({ _id: { $in: ids } });
        }
      }
    } finally {
      await mongoose.disconnect();
    }
  }
};

testDatabase().catch((error) => {
  console.error(`Database tests failed: ${error.message}`);
  process.exitCode = 1;
});

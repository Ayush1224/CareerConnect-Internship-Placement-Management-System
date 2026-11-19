import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import app from '../server.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

process.env.MONGO_DB_NAME = 'careerconnect_auth_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'careerconnect-student-profile-test-secret';

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const userIds = [];
let student;
let secondStudent;
let company;
let studentToken;
let secondStudentToken;
let companyToken;
let server;
let baseUrl;

before(async () => {
  await connectDB();
  assert.equal(mongoose.connection.name, 'careerconnect_auth_test');
  await Promise.all([User.init(), StudentProfile.init()]);

  [student, secondStudent, company] = await Promise.all([
    User.create({
      name: 'Profile Test Student',
      email: `profile-student-${suffix}@example.com`,
      password: 'TestPassword!234',
      role: 'student'
    }),
    User.create({
      name: 'Profile Test Other Student',
      email: `profile-other-student-${suffix}@example.com`,
      password: 'TestPassword!234',
      role: 'student'
    }),
    User.create({
      name: 'Profile Test Company',
      email: `profile-company-${suffix}@example.com`,
      password: 'TestPassword!234',
      role: 'company'
    })
  ]);
  userIds.push(student._id, secondStudent._id, company._id);
  studentToken = generateToken(student._id);
  secondStudentToken = generateToken(secondStudent._id);
  companyToken = generateToken(company._id);

  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/students/profile`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
  if (mongoose.connection.readyState !== 0) {
    try {
      if (userIds.length) {
        await StudentProfile.deleteMany({ userId: { $in: userIds } });
        await User.deleteMany({ _id: { $in: userIds } });
      }
    } finally {
      await mongoose.disconnect();
    }
  }
});

const request = async ({ method = 'GET', token, body } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(baseUrl, {
    method,
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
};

test('reads an authenticated student profile and supplies defaults without creating a record', async () => {
  const response = await request({ token: studentToken });
  assert.equal(response.status, 200);

  const profile = (await response.json()).data.profile;
  assert.equal(profile.name, student.name);
  assert.equal(profile.email, student.email);
  assert.equal(profile.phone, '');
  assert.equal(profile.college, '');
  assert.equal(profile.graduationYear, null);
  assert.deepEqual(profile.skills, []);
  assert.equal(Object.hasOwn(profile, 'password'), false);
  assert.equal(await StudentProfile.exists({ userId: student._id }), null);
});

test('updates only the authenticated student and persists user and profile fields', async () => {
  const response = await request({
    method: 'PATCH',
    token: studentToken,
    body: {
      name: 'Updated Profile Student',
      phone: '+1 555 0100',
      college: 'Test University',
      degree: 'B.Sc.',
      branch: 'Computer Science',
      graduationYear: '2027',
      skills: ['React', 'Node.js'],
      github: 'https://github.com/profile-test',
      linkedin: 'https://linkedin.com/in/profile-test',
      portfolio: 'https://profile.example.test',
      bio: 'A test profile.',
      location: 'Remote'
    }
  });
  assert.equal(response.status, 200);

  const profile = (await response.json()).data.profile;
  assert.equal(profile.name, 'Updated Profile Student');
  assert.equal(profile.phone, '+1 555 0100');
  assert.equal(profile.email, student.email);
  assert.equal(profile.graduationYear, 2027);
  assert.deepEqual(profile.skills, ['React', 'Node.js']);
  assert.equal(profile.resume, '');
  assert.equal(profile.location, 'Remote');

  const storedUser = await User.findById(student._id).select('name phone');
  const storedProfile = await StudentProfile.findOne({ userId: student._id });
  assert.equal(storedUser.name, 'Updated Profile Student');
  assert.equal(storedUser.phone, '+1 555 0100');
  assert.equal(storedProfile.college, 'Test University');
  assert.equal(storedProfile.graduationYear, 2027);
  assert.deepEqual(storedProfile.skills, ['React', 'Node.js']);
  assert.equal(storedProfile.profileImage, '');
  assert.equal(storedProfile.resume, '');
  assert.equal(await StudentProfile.exists({ userId: secondStudent._id }), null);

  const secondStudentResponse = await request({ token: secondStudentToken });
  assert.equal(secondStudentResponse.status, 200);
  assert.equal((await secondStudentResponse.json()).data.profile.college, '');

  const clearGraduationYear = await request({
    method: 'PATCH',
    token: studentToken,
    body: { graduationYear: null }
  });
  assert.equal(clearGraduationYear.status, 200);
  assert.equal((await clearGraduationYear.json()).data.profile.graduationYear, null);
});

test('rejects invalid fields and invalid profile values', async () => {
  for (const body of [
    {},
    { graduationYear: 1800 },
    { skills: 'React, Node.js' },
    { userId: secondStudent._id },
    { email: 'changed@example.test' },
    { resume: 'https://files.example.test/resume.pdf' },
    { profileImage: 'https://images.example.test/profile.png' }
  ]) {
    const response = await request({ method: 'PATCH', token: studentToken, body });
    assert.equal(response.status, 400);
  }
});

test('requires authentication and the student role for profile access', async () => {
  assert.equal((await request()).status, 401);
  assert.equal((await request({ method: 'PATCH', body: { college: 'Unauthorized' } })).status, 401);
  assert.equal((await request({ token: companyToken })).status, 403);
  assert.equal((await request({
    method: 'PATCH',
    token: companyToken,
    body: { college: 'Unauthorized' }
  })).status, 403);
});

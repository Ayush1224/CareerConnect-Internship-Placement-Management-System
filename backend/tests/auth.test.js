import 'dotenv/config';
import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import app from '../server.js';

process.env.MONGO_DB_NAME = 'careerconnect_auth_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'careerconnect-auth-test-secret';

const email = `auth-test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
const companyEmail = `company-${email}`;
const password = 'TestPassword!234';
let server;
let baseUrl;

before(async () => {
  assert.notEqual(process.env.MONGO_DB_NAME, 'careerconnect');
  await connectDB();
  assert.equal(mongoose.connection.name, 'careerconnect_auth_test');
  await User.init();

  server = app.listen(0);
  await new Promise((resolve, reject) => {
    server.once('listening', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/auth`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
  if (mongoose.connection.readyState !== 0) {
    try {
      await User.deleteMany({ email: { $in: [email, companyEmail] } });
    } finally {
      await mongoose.disconnect();
    }
  }
});

const request = async (path, body, token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return fetch(`${baseUrl}${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers,
    ...(body === undefined ? {} : { body: JSON.stringify(body) })
  });
};

test('registers, authenticates, restricts roles, and protects /me', async () => {
  const registration = await request('/register', {
    name: 'Auth Test Student',
    email: `  ${email.toUpperCase()}  `,
    password,
    role: 'student'
  });
  assert.equal(registration.status, 201);
  const registrationBody = await registration.json();
  assert.equal(registrationBody.data.user.email, email);
  assert.equal(Object.hasOwn(registrationBody.data.user, 'password'), false);
  assert.ok(registrationBody.data.token);

  const companyRegistration = await request('/register', {
    name: 'Auth Test Company',
    email: companyEmail,
    password,
    role: 'company'
  });
  assert.equal(companyRegistration.status, 201);
  assert.equal((await companyRegistration.json()).data.user.role, 'company');

  const storedUser = await User.findOne({ email }).select('+password');
  assert.ok(storedUser);
  assert.equal(await bcrypt.compare(password, storedUser.password), true);
  assert.notEqual(storedUser.password, password);

  const duplicate = await request('/register', {
    name: 'Duplicate Student',
    email: email.toUpperCase(),
    password,
    role: 'student'
  });
  assert.equal(duplicate.status, 409);

  const adminRegistration = await request('/register', {
    name: 'Public Admin',
    email: `admin-${email}`,
    password,
    role: 'admin'
  });
  assert.equal(adminRegistration.status, 400);

  const incorrectLogin = await request('/login', { email, password: 'incorrect-password' });
  assert.equal(incorrectLogin.status, 401);

  const correctLogin = await request('/login', { email: email.toUpperCase(), password });
  assert.equal(correctLogin.status, 200);
  const loginBody = await correctLogin.json();
  assert.equal(Object.hasOwn(loginBody.data.user, 'password'), false);
  assert.ok(loginBody.data.token);

  const unauthorizedMe = await request('/me');
  assert.equal(unauthorizedMe.status, 401);

  const authenticatedMe = await request('/me', undefined, loginBody.data.token);
  assert.equal(authenticatedMe.status, 200);
  const meBody = await authenticatedMe.json();
  assert.equal(meBody.data.user.email, email);
  assert.equal(Object.hasOwn(meBody.data.user, 'password'), false);

  await User.updateOne({ email }, { isActive: false });
  const inactiveMe = await request('/me', undefined, loginBody.data.token);
  assert.equal(inactiveMe.status, 401);
});

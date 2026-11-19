import 'dotenv/config';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { after, before, test } from 'node:test';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import connectDB from '../config/db.js';
import app from '../server.js';
import User from '../models/User.js';

process.env.MONGO_DB_NAME = 'careerconnect_auth_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'careerconnect-password-reset-test-secret';

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const email = `password-reset-${suffix}@example.com`;
const initialPassword = 'InitialPassword!234';
const sentMessages = [];
let emailFailure = false;
let originalCreateTransport;
let user;
let server;
let baseUrl;

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

before(async () => {
  originalCreateTransport = nodemailer.createTransport;
  nodemailer.createTransport = () => ({
    sendMail: async (message) => {
      if (emailFailure) throw new Error('Simulated mail transport failure');
      sentMessages.push(message);
      return { accepted: [message.to] };
    }
  });

  await connectDB();
  assert.equal(mongoose.connection.name, 'careerconnect_auth_test');
  await User.init();
  user = await User.create({
    name: 'Password Reset Test User',
    email,
    password: initialPassword,
    role: 'student'
  });

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
  nodemailer.createTransport = originalCreateTransport;
  if (mongoose.connection.readyState !== 0) {
    try {
      if (user) await User.deleteOne({ _id: user._id });
    } finally {
      await mongoose.disconnect();
    }
  }
});

const request = async (path, body) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return { status: response.status, body: await response.json() };
};

const issueResetToken = async () => {
  sentMessages.length = 0;
  const response = await request('/forgot-password', { email });
  assert.equal(response.status, 200);
  assert.equal(sentMessages.length, 1);
  const tokenMatch = sentMessages[0].text.match(/[?&]token=([a-f0-9]{64})/);
  assert.ok(tokenMatch, 'reset link should contain a 32-byte hexadecimal token');
  return tokenMatch[1];
};

test('forgot password returns a generic response and stores only a hashed, expiring token', async () => {
  const rawToken = await issueResetToken();
  const storedUser = await User.findById(user._id).select('+passwordResetToken +passwordResetExpires');
  assert.equal(storedUser.passwordResetToken, hashToken(rawToken));
  assert.notEqual(storedUser.passwordResetToken, rawToken);
  assert.ok(storedUser.passwordResetExpires > new Date());
  assert.ok(storedUser.passwordResetExpires <= new Date(Date.now() + 60 * 60 * 1000));
});

test('unknown emails receive the same generic response without sending mail', async () => {
  sentMessages.length = 0;
  const known = await request('/forgot-password', { email });
  assert.equal(known.status, 200);
  assert.equal(sentMessages.length, 1);

  sentMessages.length = 0;
  const unknown = await request('/forgot-password', { email: `unknown-${suffix}@example.com` });
  assert.equal(unknown.status, known.status);
  assert.deepEqual(unknown.body, known.body);
  assert.equal(sentMessages.length, 0);
});

test('email delivery failures are logged safely and do not leave a usable token', async () => {
  emailFailure = true;
  const loggedMessages = [];
  const originalConsoleError = console.error;
  console.error = (message) => loggedMessages.push(message);

  let response;
  try {
    response = await request('/forgot-password', { email });
  } finally {
    console.error = originalConsoleError;
    emailFailure = false;
  }

  assert.equal(response.status, 200);
  assert.equal(response.body.message, 'If an account exists for that email, password reset instructions will be sent.');
  assert.deepEqual(loggedMessages, ['Password reset email delivery failed.']);
  const storedUser = await User.findById(user._id).select('+passwordResetToken +passwordResetExpires');
  assert.equal(storedUser.passwordResetToken, undefined);
  assert.equal(storedUser.passwordResetExpires, undefined);
});

test('valid reset tokens change the password once and cannot be reused', async () => {
  const token = await issueResetToken();
  const newPassword = 'NewStrongPassword!456';
  const reset = await request('/reset-password', { token, password: newPassword });
  assert.equal(reset.status, 200);
  assert.equal(reset.body.message, 'Password reset successful');

  const storedUser = await User.findById(user._id).select('+password +passwordResetToken +passwordResetExpires');
  assert.equal(await bcrypt.compare(newPassword, storedUser.password), true);
  assert.notEqual(storedUser.password, newPassword);
  assert.equal(storedUser.passwordResetToken, undefined);
  assert.equal(storedUser.passwordResetExpires, undefined);

  const reused = await request('/reset-password', { token, password: 'AnotherStrongPassword!789' });
  assert.equal(reused.status, 400);
});

test('invalid and expired reset tokens are rejected without changing the password', async () => {
  const invalid = await request('/reset-password', {
    token: crypto.randomBytes(32).toString('hex'),
    password: 'AnotherStrongPassword!789'
  });
  assert.equal(invalid.status, 400);

  const expiredToken = crypto.randomBytes(32).toString('hex');
  await User.updateOne(
    { _id: user._id },
    {
      $set: {
        passwordResetToken: hashToken(expiredToken),
        passwordResetExpires: new Date(Date.now() - 1000)
      }
    }
  );
  const expired = await request('/reset-password', {
    token: expiredToken,
    password: 'AnotherStrongPassword!789'
  });
  assert.equal(expired.status, 400);

  const storedUser = await User.findById(user._id).select('+password');
  assert.equal(await bcrypt.compare('NewStrongPassword!456', storedUser.password), true);
});

test('reset password validation enforces strength before token consumption', async () => {
  const token = await issueResetToken();
  const response = await request('/reset-password', { token, password: 'weakpassword123' });
  assert.equal(response.status, 400);
  const storedUser = await User.findById(user._id).select('+passwordResetToken');
  assert.equal(storedUser.passwordResetToken, hashToken(token));
});

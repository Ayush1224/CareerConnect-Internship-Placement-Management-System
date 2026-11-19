import 'dotenv/config';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { after, before, test } from 'node:test';
import mongoose from 'mongoose';
import cloudinary from '../config/cloudinary.js';
import connectDB from '../config/db.js';
import app from '../server.js';
import StudentProfile from '../models/StudentProfile.js';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

process.env.MONGO_DB_NAME = 'careerconnect_auth_test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'careerconnect-profile-upload-test-secret';

const suffix = crypto.randomUUID();
const userIds = [];
const uploadCalls = [];
const deleteCalls = [];
let student;
let secondStudent;
let company;
let studentToken;
let companyToken;
let server;
let baseUrl;
let failCloudinaryUpload = false;
let failOldAssetCleanup = false;
let verifyDeleteAfterSave;
let originalUploadStream;
let originalDestroy;
let originalCloudinaryConfig;

const pdfFile = () => ({
  buffer: Buffer.from('%PDF-1.7\nTest fixture'),
  mimeType: 'application/pdf',
  filename: 'resume.pdf'
});

const imageFiles = [
  {
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
    mimeType: 'image/jpeg',
    filename: 'profile.jpg'
  },
  {
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    mimeType: 'image/png',
    filename: 'profile.png'
  },
  {
    buffer: Buffer.from('RIFF0000WEBP', 'ascii'),
    mimeType: 'image/webp',
    filename: 'profile.webp'
  }
];

before(async () => {
  originalCloudinaryConfig = cloudinary.config();
  originalUploadStream = cloudinary.uploader.upload_stream;
  originalDestroy = cloudinary.uploader.destroy;
  cloudinary.config({
    cloud_name: 'careerconnect-upload-test',
    api_key: 'test-key',
    api_secret: 'test-secret'
  });
  cloudinary.uploader.upload_stream = (options, callback) => ({
    end: (buffer) => {
      uploadCalls.push({ options, buffer });
      if (failCloudinaryUpload) {
        callback(new Error('Simulated Cloudinary failure'));
        return;
      }

      const publicId = options.public_id;
      const extension = options.resource_type === 'image' ? `.${options.format}` : '';
      callback(null, {
        public_id: publicId,
        resource_type: options.resource_type,
        secure_url: `https://res.cloudinary.com/careerconnect-upload-test/${options.resource_type}/upload/v123/${publicId}${extension}`
      });
    }
  });
  cloudinary.uploader.destroy = async (publicId, options) => {
    deleteCalls.push({ publicId, options });
    if (verifyDeleteAfterSave) await verifyDeleteAfterSave();
    if (failOldAssetCleanup) throw new Error('Simulated old asset cleanup failure');
    return { result: 'ok' };
  };

  await connectDB();
  assert.equal(mongoose.connection.name, 'careerconnect_auth_test');
  await Promise.all([User.init(), StudentProfile.init()]);

  [student, secondStudent, company] = await Promise.all([
    User.create({
      name: 'Upload Test Student',
      email: `upload-student-${suffix}@example.com`,
      password: 'UploadTestPassword!234',
      role: 'student'
    }),
    User.create({
      name: 'Upload Test Other Student',
      email: `upload-other-${suffix}@example.com`,
      password: 'UploadTestPassword!234',
      role: 'student'
    }),
    User.create({
      name: 'Upload Test Company',
      email: `upload-company-${suffix}@example.com`,
      password: 'UploadTestPassword!234',
      role: 'company'
    })
  ]);
  userIds.push(student._id, secondStudent._id, company._id);
  studentToken = generateToken(student._id);
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
  cloudinary.uploader.upload_stream = originalUploadStream;
  cloudinary.uploader.destroy = originalDestroy;
  cloudinary.config(originalCloudinaryConfig);
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

const upload = async ({ kind, file, token = studentToken }) => {
  const formData = new FormData();
  if (file) formData.append('file', new Blob([file.buffer], { type: file.mimeType }), file.filename);
  const response = await fetch(`${baseUrl}/${kind}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData
  });
  return { status: response.status, body: await response.json() };
};

test('uploads a signature-verified PDF and persists only its Cloudinary URL', async () => {
  const response = await upload({ kind: 'resume', file: pdfFile() });
  assert.equal(response.status, 200);
  assert.equal(response.body.data.profile.resume.startsWith('https://res.cloudinary.com/'), true);
  assert.equal(response.body.data.profile.profileImage, '');

  const storedProfile = await StudentProfile.findOne({ userId: student._id });
  assert.equal(storedProfile.resume, response.body.data.profile.resume);
  assert.equal(uploadCalls.at(-1).options.resource_type, 'raw');
  assert.ok(uploadCalls.at(-1).options.public_id.startsWith(`careerconnect/student-resumes/${student._id}/`));
  assert.ok(uploadCalls.at(-1).options.public_id.endsWith('.pdf'));
  assert.equal(uploadCalls.at(-1).options.public_id.includes('resume.pdf'), false);

  const previousResume = response.body.data.profile.resume;
  verifyDeleteAfterSave = async () => {
    const savedProfile = await StudentProfile.findOne({ userId: student._id });
    assert.notEqual(savedProfile.resume, previousResume);
  };
  const replacement = await upload({ kind: 'resume', file: pdfFile() });
  verifyDeleteAfterSave = null;
  assert.equal(replacement.status, 200);
  assert.equal(
    deleteCalls.at(-1).publicId,
    previousResume.split('/upload/v123/')[1]
  );
  assert.equal(deleteCalls.at(-1).options.resource_type, 'raw');
});

test('accepts JPEG, PNG, and WebP signatures and removes the previous owned image after persistence', async () => {
  for (const file of imageFiles) {
    const previousProfile = await StudentProfile.findOne({ userId: student._id });
    const previousImage = previousProfile?.profileImage || '';
    verifyDeleteAfterSave = previousImage
      ? async () => {
        const savedProfile = await StudentProfile.findOne({ userId: student._id });
        assert.notEqual(savedProfile.profileImage, previousImage);
        assert.match(savedProfile.profileImage, /^https:\/\/res\.cloudinary\.com\//);
      }
      : null;

    const response = await upload({ kind: 'image', file });
    assert.equal(response.status, 200);
    assert.match(response.body.data.profile.profileImage, /^https:\/\/res\.cloudinary\.com\//);
    assert.equal(uploadCalls.at(-1).options.resource_type, 'image');
    assert.ok(uploadCalls.at(-1).options.public_id.startsWith(`careerconnect/student-profile-images/${student._id}/`));
    assert.equal(uploadCalls.at(-1).options.format, file.mimeType.split('/')[1] === 'jpeg' ? 'jpg' : file.mimeType.split('/')[1]);
    if (previousImage) {
      const previousPublicId = previousImage.split('/upload/v123/')[1].replace(/\.(?:jpg|jpeg|png|webp)$/i, '');
      assert.equal(deleteCalls.at(-1).publicId, previousPublicId);
    }
    verifyDeleteAfterSave = null;
  }
});

test('does not delete a Cloudinary asset outside the authenticated student folder', async () => {
  const foreignPublicId = `careerconnect/student-profile-images/${secondStudent._id}/foreign-image`;
  await StudentProfile.findOneAndUpdate(
    { userId: student._id },
    {
      $set: {
        profileImage: `https://res.cloudinary.com/careerconnect-upload-test/image/upload/v123/${foreignPublicId}.png`
      },
      $setOnInsert: { userId: student._id }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  const deleteCount = deleteCalls.length;
  const response = await upload({ kind: 'image', file: imageFiles[0] });
  assert.equal(response.status, 200);
  assert.equal(deleteCalls.length, deleteCount);
});

test('rejects spoofed signatures, unsupported MIME types, missing files, and oversized files', async () => {
  const initialUploadCount = uploadCalls.length;
  const initialResume = (await StudentProfile.findOne({ userId: student._id }))?.resume || '';

  assert.equal((await upload({
    kind: 'resume',
    file: { buffer: Buffer.from('not a PDF'), mimeType: 'application/pdf', filename: 'fake.pdf' }
  })).status, 400);
  assert.equal((await upload({
    kind: 'resume',
    file: { buffer: pdfFile().buffer, mimeType: 'application/octet-stream', filename: 'resume.bin' }
  })).status, 400);
  assert.equal((await upload({ kind: 'resume', file: null })).status, 400);
  assert.equal((await upload({
    kind: 'image',
    file: { buffer: Buffer.from('not an image'), mimeType: 'image/png', filename: 'fake.png' }
  })).status, 400);
  assert.equal((await upload({
    kind: 'image',
    file: {
      buffer: Buffer.alloc(5 * 1024 * 1024 + 1, 0x41),
      mimeType: 'image/png',
      filename: 'large.png'
    }
  })).status, 413);
  assert.equal((await upload({
    kind: 'resume',
    file: {
      buffer: Buffer.alloc(10 * 1024 * 1024 + 1, 0x41),
      mimeType: 'application/pdf',
      filename: 'large.pdf'
    }
  })).status, 413);

  assert.equal(uploadCalls.length, initialUploadCount);
  assert.equal((await StudentProfile.findOne({ userId: student._id }))?.resume || '', initialResume);
});

test('requires authentication and the student role before accepting uploads', async () => {
  const previousUploadCount = uploadCalls.length;
  const file = pdfFile();
  assert.equal((await upload({ kind: 'resume', file, token: null })).status, 401);
  assert.equal((await upload({ kind: 'resume', file, token: companyToken })).status, 403);
  assert.equal(uploadCalls.length, previousUploadCount);
  assert.equal(await StudentProfile.exists({ userId: secondStudent._id }), null);
});

test('reports Cloudinary upload failures without changing the saved profile', async () => {
  const existingProfile = await StudentProfile.findOne({ userId: student._id });
  const previousResume = existingProfile.resume;
  failCloudinaryUpload = true;
  try {
    const response = await upload({ kind: 'resume', file: pdfFile() });
    assert.equal(response.status, 502);
  } finally {
    failCloudinaryUpload = false;
  }
  assert.equal((await StudentProfile.findOne({ userId: student._id })).resume, previousResume);
});

test('cleans up a new Cloudinary asset when database persistence fails', async () => {
  const originalFindOneAndUpdate = StudentProfile.findOneAndUpdate;
  const profile = await StudentProfile.findOne({ userId: student._id });
  const previousImage = profile.profileImage;
  StudentProfile.findOneAndUpdate = () => {
    const error = new Error('simulated duplicate upload');
    error.code = 11000;
    return Promise.reject(error);
  };

  try {
    const deleteCount = deleteCalls.length;
    const response = await upload({ kind: 'image', file: imageFiles[0] });
    assert.equal(response.status, 409);
    assert.equal(deleteCalls.length, deleteCount + 1);
    assert.equal(deleteCalls.at(-1).options.resource_type, 'image');
    assert.equal((await StudentProfile.findOne({ userId: student._id })).profileImage, previousImage);
  } finally {
    StudentProfile.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test('reports previous-file cleanup failure while retaining the newly saved image', async () => {
  failOldAssetCleanup = true;
  try {
    const response = await upload({ kind: 'image', file: imageFiles[1] });
    assert.equal(response.status, 200);
    assert.match(response.body.message, /previous file could not be removed/);
    assert.equal(
      (await StudentProfile.findOne({ userId: student._id })).profileImage,
      response.body.data.profile.profileImage
    );
  } finally {
    failOldAssetCleanup = false;
  }
});

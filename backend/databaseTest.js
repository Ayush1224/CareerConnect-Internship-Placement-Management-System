import 'dotenv/config';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import User from './models/User.js';
import StudentProfile from './models/StudentProfile.js';
import Company from './models/Company.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import SavedJob from './models/SavedJob.js';
import Notification from './models/Notification.js';
import Interview from './models/Interview.js';

mongoose.set('autoIndex', false);

const models = {
  users: User,
  studentprofiles: StudentProfile,
  companies: Company,
  jobs: Job,
  applications: Application,
  savedjobs: SavedJob,
  notifications: Notification,
  interviews: Interview
};

const validatorExpectations = {
  users: {
    required: ['name', 'email', 'password'],
    types: {
      name: 'string',
      email: 'string',
      password: 'string',
      phone: 'string',
      role: 'string',
      isActive: 'bool',
      createdAt: 'date',
      updatedAt: 'date'
    },
    enums: { role: ['student', 'company', 'admin'] }
  },
  studentprofiles: {
    required: ['userId'],
    types: {
      userId: 'objectId',
      profileImage: 'string',
      college: 'string',
      degree: 'string',
      branch: 'string',
      resume: 'string',
      github: 'string',
      linkedin: 'string',
      portfolio: 'string',
      bio: 'string',
      location: 'string'
    },
    numericTypes: { graduationYear: ['double', 'int', 'long', 'decimal'] },
    arrays: { skills: 'string' }
  },
  companies: {
    required: ['userId', 'companyName'],
    types: {
      userId: 'objectId',
      companyName: 'string',
      logo: 'string',
      website: 'string',
      industry: 'string',
      location: 'string',
      description: 'string',
      contactEmail: 'string',
      verified: 'bool'
    }
  },
  jobs: {
    required: ['companyId', 'title', 'description'],
    types: {
      companyId: 'objectId',
      title: 'string',
      description: 'string',
      requirements: 'string',
      jobType: 'string',
      location: 'string',
      experience: 'string',
      applicationDeadline: 'date',
      status: 'string'
    },
    numericTypes: {
      salary: ['double', 'int', 'long', 'decimal'],
      stipend: ['double', 'int', 'long', 'decimal'],
      vacancies: ['double', 'int', 'long', 'decimal']
    },
    arrays: { skillsRequired: 'string' },
    enums: {
      jobType: ['Internship', 'Full-time', 'Part-time'],
      status: ['Active', 'Closed', 'Draft']
    }
  },
  applications: {
    required: ['studentId', 'jobId', 'companyId'],
    types: {
      studentId: 'objectId',
      jobId: 'objectId',
      companyId: 'objectId',
      resume: 'string',
      coverLetter: 'string',
      status: 'string',
      appliedAt: 'date',
      updatedAt: 'date'
    },
    enums: { status: ['Applied', 'Shortlisted', 'Rejected', 'Selected'] }
  },
  savedjobs: {
    required: ['studentId', 'jobId'],
    types: {
      studentId: 'objectId',
      jobId: 'objectId',
      savedAt: 'date'
    }
  },
  notifications: {
    required: ['userId'],
    types: {
      userId: 'objectId',
      title: 'string',
      message: 'string',
      type: 'string',
      isRead: 'bool',
      createdAt: 'date'
    },
    enums: { type: ['Application', 'Job', 'Interview', 'System'] }
  },
  interviews: {
    required: ['applicationId', 'studentId', 'companyId'],
    types: {
      applicationId: 'objectId',
      studentId: 'objectId',
      companyId: 'objectId',
      scheduledAt: 'date',
      meetingLink: 'string',
      notes: 'string',
      status: 'string'
    },
    enums: { status: ['Scheduled', 'Completed', 'Cancelled'] }
  }
};

const expectedIndexes = {
  users: [{ key: { email: 1 }, unique: true }],
  studentprofiles: [{ key: { userId: 1 }, unique: true }],
  companies: [{ key: { userId: 1 }, unique: true }],
  jobs: [
    { key: { companyId: 1 } },
    { key: { status: 1, location: 1 } }
  ],
  applications: [
    { key: { studentId: 1, jobId: 1 }, unique: true },
    { key: { jobId: 1 } },
    { key: { companyId: 1 } }
  ],
  savedjobs: [{ key: { studentId: 1, jobId: 1 }, unique: true }],
  notifications: [
    { key: { userId: 1, isRead: 1 } },
    {
      key: { dedupeKey: 1 },
      unique: true,
      partialFilterExpression: { dedupeKey: { $type: 'string' } }
    }
  ],
  interviews: [
    { key: { applicationId: 1 } },
    { key: { scheduledAt: 1 } }
  ]
};

const sampleIds = {
  users: [
    '650000000000000000000001',
    '650000000000000000000002',
    '650000000000000000000003',
    '650000000000000000000004',
    '650000000000000000000005',
    '650000000000000000000006'
  ],
  studentprofiles: [
    '650000000000000000000101',
    '650000000000000000000102',
    '650000000000000000000103'
  ],
  companies: ['650000000000000000000201', '650000000000000000000202'],
  jobs: [
    '650000000000000000000301',
    '650000000000000000000302',
    '650000000000000000000303',
    '650000000000000000000304',
    '650000000000000000000305'
  ],
  applications: [
    '650000000000000000000401',
    '650000000000000000000402',
    '650000000000000000000403'
  ],
  savedjobs: ['650000000000000000000501', '650000000000000000000502'],
  notifications: [
    '650000000000000000000601',
    '650000000000000000000602',
    '650000000000000000000603'
  ],
  interviews: ['650000000000000000000701']
};

function sameIndexKeys(actual, expected) {
  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);
  return actualKeys.length === expectedKeys.length &&
    actualKeys.every((key, index) => key === expectedKeys[index] && actual[key] === expected[key]);
}

function assertValidator(collectionName, validator) {
  const expected = validatorExpectations[collectionName];
  const schema = validator && validator.$jsonSchema;
  assert.ok(schema, `${collectionName} must have a $jsonSchema validator`);
  assert.ok(
    expected.required.every((field) => schema.required.includes(field)),
    `${collectionName} is missing one or more required fields`
  );

  for (const [field, expectedType] of Object.entries(expected.types || {})) {
    assert.equal(
      schema.properties[field] && schema.properties[field].bsonType,
      expectedType,
      `${collectionName}.${field} must have bsonType ${expectedType}`
    );
  }
  for (const [field, expectedTypes] of Object.entries(expected.numericTypes || {})) {
    const actualTypes = schema.properties[field] && schema.properties[field].bsonType;
    assert.deepEqual(
      [...(Array.isArray(actualTypes) ? actualTypes : [actualTypes])].sort(),
      [...expectedTypes].sort(),
      `${collectionName}.${field} must accept BSON numeric types`
    );
  }
  for (const [field, itemType] of Object.entries(expected.arrays || {})) {
    assert.equal(schema.properties[field] && schema.properties[field].bsonType, 'array');
    assert.equal(
      schema.properties[field].items && schema.properties[field].items.bsonType,
      itemType,
      `${collectionName}.${field} must contain ${itemType} values`
    );
  }
  for (const [field, expectedValues] of Object.entries(expected.enums || {})) {
    assert.deepEqual(
      schema.properties[field] && schema.properties[field].enum,
      expectedValues,
      `${collectionName}.${field} has an unexpected enum`
    );
  }
}

async function verifyDatabase() {
  try {
    await connectDB();
    assert.equal(mongoose.connection.name, 'careerconnect');
    console.log(`Connected database: ${mongoose.connection.name}`);

    assert.equal(Object.keys(models).length, 8, 'All eight Mongoose models must import');
    const collectionInfos = await mongoose.connection.db.listCollections().toArray();
    const collectionsByName = new Map(collectionInfos.map((info) => [info.name, info]));
    const missingCollections = Object.keys(models).filter((name) => !collectionsByName.has(name));
    assert.deepEqual(missingCollections, [], 'One or more required collections are missing');
    console.log(`Collections verified: ${Object.keys(models).join(', ')}`);

    const counts = {};
    for (const [collectionName, Model] of Object.entries(models)) {
      counts[collectionName] = await Model.countDocuments({});
      assertValidator(collectionName, collectionsByName.get(collectionName).options.validator);
    }
    console.log(`Document counts: ${JSON.stringify(counts, null, 2)}`);
    console.log('Collection validators verified for required fields, types, arrays, and enums.');

    const indexResults = {};
    for (const [collectionName, specs] of Object.entries(expectedIndexes)) {
      const actualIndexes = await mongoose.connection.db.collection(collectionName).indexes();
      indexResults[collectionName] = [];
      for (const spec of specs) {
        const index = actualIndexes.find((candidate) => sameIndexKeys(candidate.key, spec.key));
        assert.ok(index, `Missing index on ${collectionName}: ${JSON.stringify(spec.key)}`);
        if (spec.unique) {
          assert.equal(index.unique, true, `Index must be unique on ${collectionName}: ${JSON.stringify(spec.key)}`);
        }
        if (spec.partialFilterExpression) {
          assert.deepEqual(
            index.partialFilterExpression,
            spec.partialFilterExpression,
            `Index must use the partial filter on ${collectionName}: ${JSON.stringify(spec.key)}`
          );
        }
        indexResults[collectionName].push({
          key: spec.key,
          present: true,
          unique: Boolean(index.unique)
        });
      }
    }
    console.log(`Required indexes verified: ${JSON.stringify(indexResults, null, 2)}`);

    const missingSamples = {};
    for (const [collectionName, Model] of Object.entries(models)) {
      const ids = sampleIds[collectionName].map((id) => new mongoose.Types.ObjectId(id));
      const found = await Model.countDocuments({ _id: { $in: ids } });
      missingSamples[collectionName] = ids.length - found;
    }
    assert.deepEqual(
      Object.fromEntries(Object.entries(missingSamples).filter(([, missing]) => missing > 0)),
      {},
      'One or more deterministic sample documents are missing'
    );
    console.log('All deterministic sample documents are present.');

    const averyId = new mongoose.Types.ObjectId('650000000000000000000002');
    const northstarId = new mongoose.Types.ObjectId('650000000000000000000201');
    const jordanApplicationId = new mongoose.Types.ObjectId('650000000000000000000402');
    const interviewId = new mongoose.Types.ObjectId('650000000000000000000701');

    const avery = await User.findById(averyId)
      .populate('studentProfile')
      .populate('applications')
      .populate('savedJobs')
      .populate('notifications');
    assert.ok(avery && avery.studentProfile, 'Avery student profile relationship is missing');
    assert.ok(avery.applications.some((item) => item._id.toString() === '650000000000000000000401'));
    assert.ok(avery.savedJobs.some((item) => item._id.toString() === '650000000000000000000501'));
    assert.ok(avery.notifications.some((item) => item._id.toString() === '650000000000000000000601'));

    const northstar = await Company.findById(northstarId).populate('jobs');
    assert.ok(northstar && northstar.jobs.length > 0, 'Northstar jobs relationship is missing');

    const application = await Application.findById(jordanApplicationId)
      .populate('studentId')
      .populate({ path: 'jobId', populate: { path: 'companyId' } })
      .populate('companyId')
      .populate('interviews');
    assert.ok(application && application.studentId, 'Application student reference is missing');
    assert.ok(application.jobId && application.jobId.companyId, 'Application job/company reference is missing');
    assert.ok(application.companyId, 'Application company reference is missing');
    assert.ok(application.interviews.some((item) => item._id.equals(interviewId)));

    const interview = await Interview.findById(interviewId)
      .populate('applicationId')
      .populate('studentId')
      .populate('companyId');
    assert.ok(
      interview && interview.applicationId && interview.studentId && interview.companyId,
      'Interview references are incomplete'
    );
    console.log('Mongoose populate relationship checks passed for students, jobs, applications, and interviews.');
    console.log('Database verification passed (read-only; no documents were inserted or deleted).');
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  }
}

verifyDatabase().catch((error) => {
  console.error(`Database verification failed: ${error.message}`);
  process.exitCode = 1;
});

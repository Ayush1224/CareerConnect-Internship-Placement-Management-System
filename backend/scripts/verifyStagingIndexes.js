import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';

const STAGING_DATABASE_NAME = 'careerconnect_staging_demo';

const sameIndexKeys = (actual, expected) => {
  const actualEntries = Object.entries(actual || {});
  const expectedEntries = Object.entries(expected);
  return actualEntries.length === expectedEntries.length
    && expectedEntries.every(([key, value], index) => (
      actualEntries[index][0] === key && actualEntries[index][1] === value
    ));
};

const verifyStagingIndexes = async () => {
  if (process.env.MONGO_DB_NAME?.trim() !== STAGING_DATABASE_NAME) {
    throw new Error(`Set MONGO_DB_NAME to ${STAGING_DATABASE_NAME}; no other database will be checked.`);
  }

  mongoose.set('autoIndex', false);
  await connectDB();

  try {
    if (mongoose.connection.name !== STAGING_DATABASE_NAME) {
      throw new Error(`Connected to unexpected database "${mongoose.connection.name}".`);
    }

    const [{ default: Application }, { default: Notification }] = await Promise.all([
      import('../models/Application.js'),
      import('../models/Notification.js')
    ]);

    const [applicationIndexes, notificationIndexes] = await Promise.all([
      Application.collection.listIndexes().toArray(),
      Notification.collection.listIndexes().toArray()
    ]);

    const hasApplicationDeduplicationIndex = applicationIndexes.some((index) => (
      index.unique === true
      && sameIndexKeys(index.key, { studentId: 1, jobId: 1 })
    ));
    const hasInterviewIdempotencyIndex = notificationIndexes.some((index) => (
      index.unique === true
      && sameIndexKeys(index.key, { dedupeKey: 1 })
      && index.partialFilterExpression?.dedupeKey?.$type === 'string'
    ));

    if (!hasApplicationDeduplicationIndex || !hasInterviewIdempotencyIndex) {
      const missing = [
        !hasApplicationDeduplicationIndex && 'unique applications(studentId, jobId)',
        !hasInterviewIdempotencyIndex && 'unique notifications(dedupeKey) partial string index'
      ].filter(Boolean);
      throw new Error(`Missing staging indexes: ${missing.join('; ')}.`);
    }

    console.log(`Verified required unique indexes in ${STAGING_DATABASE_NAME}.`);
    console.log('- applications(studentId, jobId)');
    console.log('- notifications(dedupeKey), partial for string values');
  } finally {
    await mongoose.disconnect();
  }
};

verifyStagingIndexes().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

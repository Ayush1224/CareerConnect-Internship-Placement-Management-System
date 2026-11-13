import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

export const selectDemoDatabase = () => {
  const demoDatabaseName = process.env.DEMO_DB_NAME?.trim();
  if (!demoDatabaseName) {
    throw new Error('DEMO_DB_NAME must explicitly select a dedicated demo database.');
  }
  if (!/^[A-Za-z0-9_-]{1,63}$/.test(demoDatabaseName) || !/demo/i.test(demoDatabaseName)) {
    throw new Error('DEMO_DB_NAME must be a valid database name containing "demo".');
  }
  if (['careerconnect', 'careerconnect_auth_test'].includes(demoDatabaseName.toLowerCase())) {
    throw new Error('Demo seeding is forbidden for careerconnect and careerconnect_auth_test.');
  }

  const configuredDatabaseName = process.env.MONGO_DB_NAME?.trim();
  if (configuredDatabaseName && configuredDatabaseName !== demoDatabaseName) {
    throw new Error('MONGO_DB_NAME must match DEMO_DB_NAME before demo seeding.');
  }

  return demoDatabaseName;
};

export const connectToDemoDatabase = async () => {
  const demoDatabaseName = selectDemoDatabase();
  process.env.MONGO_DB_NAME = demoDatabaseName;
  await connectDB();
  const connectedDatabaseName = mongoose.connection.name;
  if (connectedDatabaseName !== demoDatabaseName) {
    await mongoose.disconnect();
    throw new Error(`Connected to unexpected database "${connectedDatabaseName}".`);
  }
  return demoDatabaseName;
};

export const validateSeedPassword = (password, variableName) => {
  if (!password || password.length < 12 || /replace_with/i.test(password)) {
    throw new Error(`${variableName} must be a configured password of at least 12 characters, not a placeholder.`);
  }
};

export const upsertSeedUser = async ({ name, email, password, role }) => {
  validateSeedPassword(password, 'SEED_PASSWORD');
  const normalizedEmail = email.trim().toLowerCase();
  const user = await User.findOneAndUpdate(
    { email: normalizedEmail },
    {
      $setOnInsert: {
        name: name.trim(),
        email: normalizedEmail,
        password: await bcrypt.hash(password, 10),
        role,
        isActive: true
      }
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  if (user.role !== role) {
    throw new Error(`Seed email ${normalizedEmail} is already associated with a different role.`);
  }
  if (!user.isActive) {
    throw new Error(`Seed account ${normalizedEmail} is inactive; reactivate it explicitly before using the demo.`);
  }
  return user;
};

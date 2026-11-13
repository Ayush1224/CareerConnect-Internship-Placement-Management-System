import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import { connectToDemoDatabase, validateSeedPassword } from './seedHelpers.js';

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be set in backend/.env.');
  }
  validateSeedPassword(ADMIN_PASSWORD, 'ADMIN_PASSWORD');

  const demoDatabaseName = process.env.DEMO_DB_NAME?.trim();
  if (demoDatabaseName) {
    await connectToDemoDatabase();
  } else {
    const databaseName = process.env.MONGO_DB_NAME?.trim();
    if (!databaseName) {
      throw new Error('MONGO_DB_NAME must be explicitly selected before running the admin seeder.');
    }
    await connectDB();
    if (mongoose.connection.name !== databaseName) {
      throw new Error(`Connected to unexpected database "${mongoose.connection.name}".`);
    }
  }

  try {
    await User.init();
    const password = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const normalizedEmail = ADMIN_EMAIL.trim().toLowerCase();
    const admin = await User.findOneAndUpdate(
      { email: normalizedEmail },
      {
        $setOnInsert: {
          name: ADMIN_NAME.trim(),
          email: normalizedEmail,
          password,
          role: 'admin',
          isActive: true
        }
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    if (admin.role !== 'admin') {
      throw new Error('ADMIN_EMAIL already belongs to a non-admin account; no account data was changed.');
    }

    console.log('Admin account created or already provisioned; existing account data was not changed.');
    console.log(`Database selected: ${mongoose.connection.name}`);
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

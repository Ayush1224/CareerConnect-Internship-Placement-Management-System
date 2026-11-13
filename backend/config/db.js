import mongoose from 'mongoose';

const connectDB = async () => {
  const databaseName = process.env.MONGO_DB_NAME || 'careerconnect';
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required to connect to MongoDB.');
  }

  const uriMatch = mongoUri.match(/^mongodb(?:\+srv)?:\/\/(?:[^@/]+@)?([^/?]+)/i);
  if (!uriMatch) {
    throw new Error('MONGO_URI must be a valid MongoDB Atlas connection string.');
  }

  const hosts = uriMatch[1].split(',');
  if (hosts.some((host) => /^(\[::1\]|localhost|127(?:\.\d{1,3}){3})(?::\d+)?$/i.test(host))) {
    throw new Error('MONGO_URI must point to MongoDB Atlas; local MongoDB connections are not supported.');
  }

  try {
    await mongoose.connect(mongoUri, { dbName: databaseName });
    if (mongoose.connection.name !== databaseName) {
      throw new Error(`Connected to unexpected database "${mongoose.connection.name}".`);
    }
    console.log(`MongoDB Atlas connected to database "${databaseName}".`);
  } catch (error) {
    const errorType = error instanceof Error ? error.name : 'UnknownError';
    throw new Error(
      `MongoDB Atlas connection failed (${errorType}). Check MONGO_URI and Atlas network access.`
    );
  }
};

export default connectDB;

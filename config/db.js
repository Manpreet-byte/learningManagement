const mongoose = require('mongoose');

const DEFAULT_DATABASE = 'lms_db';
const DEFAULT_MONGO_URI = `mongodb://127.0.0.1:27017/${DEFAULT_DATABASE}`;

const resolveMongoUri = (uri) => {
  if (!uri) {
    return DEFAULT_MONGO_URI;
  }

  try {
    const parsed = new URL(uri);

    if (!parsed.pathname || parsed.pathname === '/') {
      parsed.pathname = `/${DEFAULT_DATABASE}`;
      return parsed.toString();
    }

    return uri;
  } catch (error) {
    return uri.endsWith('/') ? `${uri}${DEFAULT_DATABASE}` : uri;
  }
};

const connectDB = async () => {
  const mongoUri = resolveMongoUri(process.env.MONGO_URI);

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected');
  } catch (error) {
    const message = error?.message || String(error);
    const dnsError =
      typeof message === 'string' &&
      (message.includes('querySrv') || message.includes('queryA')) &&
      (message.includes('ECONNREFUSED') || message.includes('ENOTFOUND'));

    if (dnsError) {
      throw new Error(
        `MongoDB connection failed due to DNS resolution issues (${message}). If you're using MongoDB Atlas (mongodb+srv), ensure your network/DNS allows external lookups, or use a local MongoDB like mongodb://127.0.0.1:27017/lms_db.`
      );
    }

    const localMongoRefused =
      typeof message === 'string' &&
      message.includes('ECONNREFUSED') &&
      (message.includes('127.0.0.1:27017') || message.includes('localhost:27017'));

    if (localMongoRefused) {
      throw new Error(
        `MongoDB connection refused (${message}). Start MongoDB locally (mongod on port 27017) or change MONGO_URI in learningManagementSystem/.env to a reachable MongoDB instance.`
      );
    }

    throw error;
  }
};

module.exports = connectDB;

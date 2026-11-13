const mongoose = require('mongoose');
module.exports = async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI is required. Configure backend/.env before starting the API.');
  mongoose.set('bufferCommands', false);
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
  console.log('MongoDB connected.');
};

const mongoose = require('mongoose');
require('dotenv').config();

const dbuser = process.env.DB_USER;
const dbpassword = process.env.DB_PASS;

async function connectDB() {
  try {
    await mongoose.connect(`mongodb+srv://${dbuser}:${dbpassword}@jsonconvertdb.k4m8rb0.mongodb.net/?retryWrites=true&w=majority&appName=jsonConvertDb`);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('[Error] MongoDB connection error:', error);
    process.exit(1);
  }
}

module.exports = connectDB;
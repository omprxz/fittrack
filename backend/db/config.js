const mongoose = require('mongoose');
require('dotenv').config();

async function connectToMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

module.exports = connectToMongoDB;
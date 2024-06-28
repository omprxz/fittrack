const mongoose = require('mongoose');
require('dotenv').config()

const mongodb = mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

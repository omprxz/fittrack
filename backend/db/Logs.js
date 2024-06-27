const mongoose = require('mongoose');

const logsSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  photos: {
    type: []
  },
  categories: {
    type: []
  },
  weight: {
    type: Number,
    default: null
  },
  weightUnit: String,
  height: {
    type: Number,
    default: null
  },
  heightUnit: String,
  fat: {
    type: Number,
    default: null
  },
  note: {
    type: String,
    maxlength: 1000
  }},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    }
});

const Logs = mongoose.model('Log', logsSchema, 'logs');
module.exports = Logs;
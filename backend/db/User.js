const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  ip: String,
  pp: String},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    }
});

const User = mongoose.model('User', userSchema, 'users');
module.exports = User;
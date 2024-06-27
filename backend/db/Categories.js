const mongoose = require('mongoose');
const categSchema = new mongoose.Schema({
  userId: String,
  categories: []},{
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        currentTime: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    }
});

const Categories = mongoose.model('Categories', categSchema, 'categories');
module.exports = Categories;
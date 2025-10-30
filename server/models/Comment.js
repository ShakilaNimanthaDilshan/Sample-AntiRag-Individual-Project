// server/models/Comment.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  anonymous: { type: Boolean, default: false },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
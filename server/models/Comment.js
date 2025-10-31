// server/models/Comment.js
const mongoose = require('mongoose');

// --- NEW: Define a schema for replies ---
const replySchema = new mongoose.Schema({
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  anonymous: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
// --- End of new part ---

const commentSchema = new mongoose.Schema({
  report: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  anonymous: { type: Boolean, default: false },
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  
  // --- ADD THIS LINE ---
  replies: [replySchema] // Embed the replies
});

module.exports = mongoose.model('Comment', commentSchema);
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String },
  body: { type: String, required: true },
  university: { type: mongoose.Schema.Types.ObjectId, ref: 'University', required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  anonymous: { type: Boolean, default: false },
  media: [{ url: String, type: String }], // we'll handle uploads later
  status: { type: String, enum: ['pending', 'verified'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);

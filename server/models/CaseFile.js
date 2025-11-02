// server/models/CaseFile.js
const mongoose = require('mongoose');

const caseFileSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }, // The full story
  dateOfIncident: { type: Date },
  sourceUrl: { type: String }, // Link to a news article or source
  imageUrl: { type: String }, // Link to a cover image
  author: { // Which admin or mod created this entry
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

module.exports = mongoose.model('CaseFile', caseFileSchema);
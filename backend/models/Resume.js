// backend/models/Resume.js (Updated to remove filePath)

const mongoose = require('mongoose');

const JobMatchAnalysisSchema = new mongoose.Schema({
    matchPercentage: { type: Number, required: true },
    pros: { type: [String], required: true },
    cons: { type: [String], required: true }
});

const ResumeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  // filePath is no longer needed
  originalContent: { type: String, required: true },
  analysis: {
    resumeScore: { type: Number },
    skillGap: { type: [String] },
    suggestions: { type: [String] },
    smartSummary: { type: String },
    jobMatchAnalysis: JobMatchAnalysisSchema
  }
}, { timestamps: true });

const Resume = mongoose.model('Resume', ResumeSchema);
module.exports = Resume;
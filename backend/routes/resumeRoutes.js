const express = require('express');
const router = express.Router();
const { 
    upload, 
    analyzeResume, 
    uploadMultiple, 
    rankResumes 
} = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/rank', protect, authorize('recruiter'), uploadMultiple, rankResumes);

router.post('/analyze', protect, authorize('user'), upload, analyzeResume);

module.exports = router;


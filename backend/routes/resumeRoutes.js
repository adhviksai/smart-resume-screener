const express = require('express');
const router = express.Router();
const { 
    upload, 
    uploadResume, 
    analyzeResume, 
    uploadMultiple, 
    rankResumes 
} = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/rank', protect, authorize('recruiter'), uploadMultiple, rankResumes);

router.post('/upload', protect, authorize('user'), upload, uploadResume);
router.post('/analyze/:id', protect, authorize('user'), analyzeResume);

module.exports = router;


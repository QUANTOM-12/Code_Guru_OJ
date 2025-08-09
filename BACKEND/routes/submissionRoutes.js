const express = require('express');
const {
  getSubmissions,
  getSubmissionById,
  getUserSubmissions,
  getRecentSubmissions,
  deleteSubmission
} = require('../controllers/submissionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/', getSubmissions);
router.get('/recent', getRecentSubmissions);
router.get('/user/:userId', getUserSubmissions);
router.get('/:id', getSubmissionById);

// Admin only
router.delete('/:id', authorize('admin'), deleteSubmission);

module.exports = router;
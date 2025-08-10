const express = require('express');
const {
  getSubmissions,
  getSubmissionById,
  getUserSubmissions,
  getRecentSubmissions,
  deleteSubmission,
  // Add these new functions
  submitSolution,
  getHint
} = require('../controllers/submissionController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Existing routes
router.get('/', getSubmissions);
router.get('/recent', getRecentSubmissions);
router.get('/user/:userId', getUserSubmissions);
router.get('/:id', getSubmissionById);

// NEW ROUTES for code submission
router.post('/submit', submitSolution);        // Submit code
router.post('/hint', getHint);                 // Get AI hint

// Admin only
router.delete('/:id', authorize('admin'), deleteSubmission);

module.exports = router;

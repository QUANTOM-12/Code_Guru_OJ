const express = require('express');
const {
  getContests,
  getContest,
  createContest,
  updateContest,
  deleteContest,
  joinContest,
  getContestLeaderboard
} = require('../controllers/contestController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getContests);
router.get('/:id', getContest);
router.get('/:id/leaderboard', getContestLeaderboard);

// Protected routes
router.use(protect);
router.post('/:id/join', joinContest);

// Admin only
router.post('/', authorize('admin'), createContest);
router.put('/:id', authorize('admin'), updateContest);
router.delete('/:id', authorize('admin'), deleteContest);

module.exports = router;
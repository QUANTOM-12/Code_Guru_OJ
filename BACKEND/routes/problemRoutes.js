const express = require('express');
const {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  deleteProblem,
  searchProblems
} = require('../controllers/problemController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getProblems);
router.get('/search', searchProblems);
router.get('/:id', getProblem);

// Protected routes (Admin only for creating/updating/deleting problems)
router.use(protect);
router.post('/', authorize('admin'), createProblem);
router.put('/:id', authorize('admin'), updateProblem);
router.delete('/:id', authorize('admin'), deleteProblem);

module.exports = router;
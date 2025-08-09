const express = require('express');
const { userUpdateValidation, validate } = require('../utils/validators');
const { getAllUsers, getUserById, updateUser, deleteUser, getUserStats, getUserSubmissions } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', getAllUsers);

router.use(protect);
router.get('/me/stats', getUserStats);
router.get('/me/submissions', getUserSubmissions);
router.get('/:id', getUserById);
router.put('/me', validate(userUpdateValidation), updateUser);

router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;

const express = require('express');
const { submissionValidation, validate } = require('../utils/validators');
const { runCode, submitSolution, getSubmissionStatus } = require('../controllers/compilerController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/run', runCode);
router.post('/submit', protect, validate(submissionValidation), submitSolution);
router.get('/submission/:id', protect, getSubmissionStatus);

module.exports = router;

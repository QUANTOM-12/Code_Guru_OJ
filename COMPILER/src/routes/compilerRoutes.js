const express = require('express');
const { runCode } = require('../controllers/compilerController');

const router = express.Router();

// Check if runCode is properly imported
console.log('runCode function:', runCode); // This will help debug

router.post('/run', runCode);

// Add this route for AI hints
router.post('/hint/:problemId', protect, getHint);

module.exports = router;
const express = require('express');
const { runCode, getHint, debugCode, optimizeCode } = require('../controllers/compilerController');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Rate limiting for different endpoints
const codeExecutionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 executions per minute
  message: {
    success: false,
    error: 'Too many code executions. Please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 AI requests per minute (Gemini free tier limit)
  message: {
    success: false,
    error: 'Too many AI requests. Please wait before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Input validation middleware
const validateCodeInput = (req, res, next) => {
  const { code, language } = req.body;
  if (!code || typeof code !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Valid code is required'
    });
  }

  if (!language || typeof language !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Programming language is required'
    });
  }

  const supportedLanguages = ['python', 'cpp', 'java', 'javascript'];
  if (!supportedLanguages.includes(language.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: `Unsupported language. Supported: ${supportedLanguages.join(', ')}`
    });
  }

  next();
};

// Routes
router.post('/run', codeExecutionLimiter, validateCodeInput, runCode);
router.post('/hint', aiLimiter, validateCodeInput, getHint);
router.post('/debug', aiLimiter, validateCodeInput, debugCode);
router.post('/optimize', aiLimiter, validateCodeInput, optimizeCode);

// Test AI availability
router.get('/ai-status', (req, res) => {
  const aiService = require('../services/aiServices'); // Fixed path
  res.json({
    success: true,
    aiEnabled: aiService.isEnabled(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
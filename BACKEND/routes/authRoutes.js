const express = require('express');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
  validate,
  validateIPAddress
} = require('../utils/validators');

const {
  register,
  login,
  getMe,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  changePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter, registrationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply IP address validation to all routes
router.use(validateIPAddress);

// Public routes with rate limiting
router.post('/register', registrationLimiter, validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);

// Email verification (public)
router.get('/verify-email/:token', verifyEmail);

// Password reset (public with strict rate limiting)
router.post('/forgot-password', passwordResetLimiter, validate(forgotPasswordValidation), forgotPassword);
router.put('/reset-password/:resettoken', passwordResetLimiter, validate(resetPasswordValidation), resetPassword);

// Protected routes
router.use(protect); // All routes after this middleware are protected

router.get('/me', getMe);
router.post('/logout', logout);
router.put('/change-password', validate(changePasswordValidation), changePassword);

module.exports = router;
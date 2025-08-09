const express = require('express');
const { registerValidation, loginValidation, validate } = require('../utils/validators');
const { register, login, getMe, logout } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/logout', logout);
router.get('/me', protect, getMe);

module.exports = router;

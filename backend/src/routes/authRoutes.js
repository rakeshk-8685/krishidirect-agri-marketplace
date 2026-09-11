const express = require('express');
const router = express.Router();
const { register, login, me, updateProfile, googleAuth } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { asyncHandler } = require('../middleware/errorHandler');
const { validateRegister, validateLogin } = require('../middleware/validation');

router.post('/register', validateRegister, asyncHandler(register));
router.post('/login', validateLogin, asyncHandler(login));
router.post('/google', asyncHandler(googleAuth));
router.get('/me', authenticateToken, asyncHandler(me));
router.put('/profile', authenticateToken, asyncHandler(updateProfile));

module.exports = router;

const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser, refreshToken, logout } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  validateRegister, 
  validateLogin 
} = require('../middleware/validateRequest');

// Routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authMiddleware, getCurrentUser);
router.post('/refresh', refreshToken);
router.post('/logout', authMiddleware, logout);

// Export router
module.exports = router;
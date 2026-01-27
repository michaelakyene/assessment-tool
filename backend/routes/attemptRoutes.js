const express = require('express');
const router = express.Router();
const { 
  startAttempt, 
  submitAttempt, 
  getAttempt, 
  getUserAttempts,
  timeoutAttempt
} = require('../controllers/attemptController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Routes
router.post('/start', authMiddleware, startAttempt);
router.post('/submit', authMiddleware, submitAttempt);
router.post('/timeout', authMiddleware, timeoutAttempt);
router.get('/user', authMiddleware, getUserAttempts);
router.get('/:id', authMiddleware, getAttempt);

// Export router
module.exports = router;
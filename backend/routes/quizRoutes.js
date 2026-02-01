const express = require('express');
const router = express.Router();
const { 
  createQuiz, 
  getLecturerQuizzes, 
  getQuizById, 
  updateQuiz, 
  deleteQuiz,
  togglePublish,
  getQuizResults,
  getAvailableQuizzes,
  verifyQuizPassword,
  duplicateQuiz
} = require('../controllers/quizController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { validateQuizCreate, validateMongoId } = require('../middleware/validateRequest');

// IMPORTANT: Specific routes MUST come before generic routes (/:id) to avoid route matching conflicts

// Student routes (specific endpoints first)
router.get('/available', authMiddleware, getAvailableQuizzes);
router.post('/:id/verify-password', authMiddleware, ...validateMongoId(), verifyQuizPassword);

// Lecturer routes (specific endpoints)
router.get('/lecturer', authMiddleware, roleMiddleware('lecturer'), getLecturerQuizzes);
router.get('/lecturer/:id', authMiddleware, roleMiddleware('lecturer'), ...validateMongoId(), getQuizById);
router.post('/:id/duplicate', authMiddleware, roleMiddleware('lecturer'), ...validateMongoId(), duplicateQuiz);
router.get('/:id/results', authMiddleware, roleMiddleware('lecturer'), ...validateMongoId(), getQuizResults);
router.patch('/:id/publish', authMiddleware, roleMiddleware('lecturer'), ...validateMongoId(), togglePublish);

// Generic routes (MUST come last)
router.post('/', authMiddleware, roleMiddleware('lecturer'), validateQuizCreate, createQuiz);
router.put('/:id', authMiddleware, roleMiddleware('lecturer'), ...validateMongoId(), validateQuizCreate, updateQuiz);
router.delete('/:id', authMiddleware, roleMiddleware('lecturer'), ...validateMongoId(), deleteQuiz);
router.get('/:id', authMiddleware, ...validateMongoId(), getQuizById);

// Export router
module.exports = router;
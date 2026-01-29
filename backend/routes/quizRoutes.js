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

// Lecturer routes
router.post('/', authMiddleware, roleMiddleware('lecturer'), createQuiz);
router.get('/lecturer', authMiddleware, roleMiddleware('lecturer'), getLecturerQuizzes);
router.get('/lecturer/:id', authMiddleware, roleMiddleware('lecturer'), getQuizById);
router.put('/:id', authMiddleware, roleMiddleware('lecturer'), updateQuiz);
router.delete('/:id', authMiddleware, roleMiddleware('lecturer'), deleteQuiz);
router.patch('/:id/publish', authMiddleware, roleMiddleware('lecturer'), togglePublish);
router.get('/:id/results', authMiddleware, roleMiddleware('lecturer'), getQuizResults);
router.post('/:id/duplicate', authMiddleware, roleMiddleware('lecturer'), duplicateQuiz);

// Student routes
router.get('/available', authMiddleware, getAvailableQuizzes);
router.post('/:id/verify-password', authMiddleware, verifyQuizPassword);
router.get('/:id', authMiddleware, getQuizById);

// Export router
module.exports = router;
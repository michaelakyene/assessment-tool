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

// Lecturer routes
router.post('/', authMiddleware, roleMiddleware('lecturer'), validateQuizCreate, createQuiz);
router.get('/lecturer', authMiddleware, roleMiddleware('lecturer'), getLecturerQuizzes);
router.get('/lecturer/:id', authMiddleware, roleMiddleware('lecturer'), validateMongoId, getQuizById);
router.put('/:id', authMiddleware, roleMiddleware('lecturer'), validateMongoId, validateQuizCreate, updateQuiz);
router.delete('/:id', authMiddleware, roleMiddleware('lecturer'), validateMongoId, deleteQuiz);
router.patch('/:id/publish', authMiddleware, roleMiddleware('lecturer'), validateMongoId, togglePublish);
router.get('/:id/results', authMiddleware, roleMiddleware('lecturer'), validateMongoId, getQuizResults);
router.post('/:id/duplicate', authMiddleware, roleMiddleware('lecturer'), validateMongoId, duplicateQuiz);

// Student routes
router.get('/available', authMiddleware, getAvailableQuizzes);
router.post('/:id/verify-password', authMiddleware, validateMongoId, verifyQuizPassword);
router.get('/:id', authMiddleware, validateMongoId, getQuizById);

// Export router
module.exports = router;
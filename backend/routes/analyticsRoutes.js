const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const { validateMongoId } = require('../middleware/validateRequest');
const {
  getOverview,
  getQuizAnalytics,
  getStudentAnalytics
} = require('../controllers/analyticsController');

// Lecturer-only routes
router.get('/overview', authMiddleware, roleMiddleware('lecturer'), getOverview);
router.get('/quiz/:quizId', authMiddleware, roleMiddleware('lecturer'), validateMongoId('quizId'), getQuizAnalytics);
router.get('/student/me', authMiddleware, getStudentAnalytics);
router.get('/student/:studentId', authMiddleware, roleMiddleware('lecturer'), validateMongoId('studentId'), getStudentAnalytics);

module.exports = router;
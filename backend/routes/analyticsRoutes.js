const express = require('express');
const router = express.Router();
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');
const {
  getOverview,
  getQuizAnalytics,
  getStudentAnalytics
} = require('../controllers/analyticsController');

// Lecturer-only routes
router.get('/overview', authMiddleware, roleMiddleware('lecturer'), getOverview);
router.get('/quiz/:quizId', authMiddleware, roleMiddleware('lecturer'), getQuizAnalytics);
router.get('/student/:studentId', authMiddleware, roleMiddleware('lecturer'), getStudentAnalytics);

module.exports = router;
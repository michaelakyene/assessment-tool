const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const User = require('../models/User');

exports.getOverview = async (req, res) => {
  try {
    const lecturerId = req.user._id;
    
    // Get all quizzes created by lecturer
    const lecturerQuizzes = await Quiz.find({ createdBy: lecturerId }).select('_id').lean();
    const quizIds = lecturerQuizzes.map(q => q._id);

    const [
      totalQuizzes,
      totalAttempts,
      totalStudents
    ] = await Promise.all([
      Promise.resolve(lecturerQuizzes.length),
      Attempt.countDocuments({ 
        quiz: { $in: quizIds },
        status: { $in: ['submitted', 'completed'] }
      }),
      Attempt.distinct('user', { 
        quiz: { $in: quizIds },
        status: { $in: ['submitted', 'completed'] }
      }).then(users => users.length)
    ]);

    // Get average percentage instead of complex aggregation
    const averageData = await Attempt.findOne({
      quiz: { $in: quizIds },
      status: { $in: ['submitted', 'completed'] }
    })
    .select('scorePercentage')
    .sort({ createdAt: -1 })
    .lean();

    // Calculate simple average
    const allAttempts = await Attempt.find({
      quiz: { $in: quizIds },
      status: { $in: ['submitted', 'completed'] }
    })
    .select('scorePercentage')
    .limit(100)
    .lean();

    const averagePercentage = allAttempts.length > 0
      ? Math.round(allAttempts.reduce((sum, a) => sum + (a.scorePercentage || 0), 0) / allAttempts.length * 100) / 100
      : 0;

    res.json({
      totalQuizzes,
      totalAttempts,
      totalStudents,
      averagePercentage
    });
  } catch (error) {
    console.error('Overview error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

exports.getQuizAnalytics = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId).lean();
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Optimized query with timeout and pagination
    const attempts = await Attempt.find({
      quiz: quiz._id,
      status: { $in: ['submitted', 'completed', 'timeout'] }
    })
      .select('user scorePercentage obtainedMarks totalMarks status createdAt answers')
      .populate('user', 'name studentId email')
      .sort({ createdAt: -1 })
      .limit(1000)
      .maxTimeMS(5000)
      .lean();

    const totalAttempts = attempts.length;
    const uniqueStudents = new Set(
      attempts
        .map(attempt => attempt.user?._id?.toString())
        .filter(Boolean)
    ).size;

    // Use scorePercentage field instead of calculating
    const averagePercentage = totalAttempts
      ? attempts.reduce((sum, attempt) => sum + (attempt.scorePercentage || 0), 0) / totalAttempts
      : 0;

    const completedAttempts = attempts.filter(attempt => attempt.status === 'submitted' || attempt.status === 'completed');
    const completionRate = totalAttempts
      ? (completedAttempts.length / totalAttempts) * 100
      : 0;

    const passingScore = quiz.passingScore || 50;
    const passRate = completedAttempts.length
      ? (completedAttempts.filter(attempt => (attempt.scorePercentage || 0) >= passingScore).length / completedAttempts.length) * 100
      : 0;

    // Calculate question difficulty from answer data
    const questionDifficulty = {};
    quiz.questions?.forEach((question, index) => {
      const totalAnswered = attempts.filter(a => a.answers && a.answers[index]).length;
      const correctAnswers = attempts.filter(a => 
        a.answers && a.answers[index]?.isCorrect === true
      ).length;
      questionDifficulty[index] = {
        correctCount: correctAnswers,
        totalAttempted: totalAnswered,
        correctRate: totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0
      };
    });

    res.json({
      totalAttempts,
      uniqueStudents,
      averagePercentage: Math.round(averagePercentage * 100) / 100,
      completionRate: Math.round(completionRate * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      questionDifficulty,
      attempts: attempts.map(attempt => ({
        _id: attempt._id,
        student: {
          _id: attempt.user?._id,
          name: attempt.user?.name || 'Unknown Student',
          studentId: attempt.user?.studentId || 'N/A',
          email: attempt.user?.email
        },
        scorePercentage: attempt.scorePercentage || 0,
        obtainedMarks: attempt.obtainedMarks || 0,
        totalMarks: attempt.totalMarks || 0,
        status: attempt.status,
        submittedAt: attempt.createdAt,
        attemptNumber: attempt.attemptNumber
      }))
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz analytics', error: error.message });
  }
};

exports.getStudentAnalytics = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    const analytics = await Attempt.aggregate([
      { $match: { user: studentId } },
      {
        $group: {
          _id: null,
          totalQuizzes: { $addToSet: '$quiz' },
          totalAttempts: { $sum: 1 },
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' },
          bestScore: { $max: '$percentage' },
          recentAttempts: {
            $push: {
              quiz: '$quiz',
              score: '$score',
              percentage: '$percentage',
              date: '$createdAt'
            }
          }
        }
      },
      {
        $project: {
          totalQuizzesTaken: { $size: '$totalQuizzes' },
          totalAttempts: 1,
          averageScore: { $round: ['$averageScore', 2] },
          averagePercentage: { $round: ['$averagePercentage', 2] },
          bestScore: { $round: ['$bestScore', 2] },
          recentAttempts: { $slice: ['$recentAttempts', -5] }
        }
      }
    ]);

    res.json(analytics[0] || {});
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch student analytics', error: error.message });
  }
};
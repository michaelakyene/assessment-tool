const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const User = require('../models/User');

exports.getOverview = async (req, res) => {
  try {
    const lecturerId = req.user._id;
    
    const [
      totalQuizzes,
      totalAttempts,
      totalStudents,
      averageScores
    ] = await Promise.all([
      Quiz.countDocuments({ createdBy: lecturerId }),
      Attempt.countDocuments({ 
        quiz: { $in: await Quiz.find({ createdBy: lecturerId }).distinct('_id') }
      }),
      User.countDocuments({ role: 'student' }),
      Attempt.aggregate([
        {
          $lookup: {
            from: 'quizzes',
            localField: 'quiz',
            foreignField: '_id',
            as: 'quizData'
          }
        },
        { $unwind: '$quizData' },
        { $match: { 'quizData.createdBy': lecturerId } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            avgPercentage: { $avg: '$percentage' }
          }
        }
      ])
    ]);

    res.json({
      totalQuizzes,
      totalAttempts,
      totalStudents,
      averageScore: averageScores[0]?.avgScore || 0,
      averagePercentage: averageScores[0]?.avgPercentage || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

exports.getQuizAnalytics = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const attempts = await Attempt.find({
      quiz: quiz._id,
      status: { $in: ['completed', 'timeout'] }
    })
      .populate('user', 'name indexNumber email')
      .sort({ endTime: -1, createdAt: -1 })
      .lean();

    const totalAttempts = attempts.length;
    const uniqueStudents = new Set(
      attempts
        .map(attempt => attempt.user?._id?.toString())
        .filter(Boolean)
    ).size;

    const averageScore = totalAttempts
      ? attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / totalAttempts
      : 0;

    const averagePercentage = totalAttempts
      ? attempts.reduce((sum, attempt) => sum + (attempt.percentage || 0), 0) / totalAttempts
      : 0;

    const completedAttempts = attempts.filter(attempt => attempt.status === 'completed');
    const completionRate = totalAttempts
      ? (completedAttempts.length / totalAttempts) * 100
      : 0;

    const passingScore = quiz.passingScore || 50;
    const passRate = completedAttempts.length
      ? (completedAttempts.filter(attempt => (attempt.percentage || 0) >= passingScore).length / completedAttempts.length) * 100
      : 0;

    res.json({
      totalAttempts,
      uniqueStudents,
      averageScore,
      averagePercentage,
      completionRate,
      passRate,
      attempts: attempts.map(attempt => ({
        _id: attempt._id,
        student: {
          _id: attempt.user?._id,
          name: attempt.user?.name || 'Unknown Student',
          indexNumber: attempt.user?.indexNumber || 'N/A',
          email: attempt.user?.email
        },
        score: attempt.score || 0,
        percentage: attempt.percentage || 0,
        totalMarks: attempt.totalMarks || 0,
        status: attempt.status,
        timeTaken: attempt.timeTaken,
        submittedAt: attempt.endTime || attempt.createdAt,
        attemptNumber: attempt.attemptNumber
      }))
    });
  } catch (error) {
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
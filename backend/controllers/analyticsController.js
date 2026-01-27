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

    const analytics = await Attempt.aggregate([
      { $match: { quiz: quiz._id } },
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          uniqueStudents: { $addToSet: '$user' },
          averageScore: { $avg: '$score' },
          averagePercentage: { $avg: '$percentage' },
          completionRate: {
            $avg: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          scoreDistribution: {
            $push: {
              score: '$score',
              percentage: '$percentage'
            }
          }
        }
      },
      {
        $project: {
          totalAttempts: 1,
          uniqueStudents: { $size: '$uniqueStudents' },
          averageScore: { $round: ['$averageScore', 2] },
          averagePercentage: { $round: ['$averagePercentage', 2] },
          completionRate: { $multiply: [{ $round: ['$completionRate', 2] }, 100] }
        }
      }
    ]);

    res.json(analytics[0] || {});
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
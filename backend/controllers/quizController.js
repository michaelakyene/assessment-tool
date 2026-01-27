const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

// Create new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { title, description, duration, maxAttempts, questions } = req.body;

    const quiz = new Quiz({
      title,
      description,
      duration,
      maxAttempts,
      questions,
      createdBy: req.user._id,
      isPublished: false
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create quiz', error: error.message });
  }
};

// Get all quizzes for lecturer
exports.getLecturerQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quiz', error: error.message });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    res.json({
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update quiz', error: error.message });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    // Delete associated attempts
    await Attempt.deleteMany({ quiz: req.params.id });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
  }
};

// Publish/unpublish quiz
exports.togglePublish = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: { isPublished: req.body.isPublished } },
      { new: true }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    res.json({
      message: `Quiz ${quiz.isPublished ? 'published' : 'unpublished'} successfully`,
      quiz
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update quiz', error: error.message });
  }
};

// Get quiz results
exports.getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const attempts = await Attempt.find({ quiz: req.params.id })
      .populate('user', 'name email studentId')
      .sort({ createdAt: -1 });

    res.json({
      quiz,
      attempts,
      totalAttempts: attempts.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch results', error: error.message });
  }
};

// Get available quizzes for students
exports.getAvailableQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({
      isPublished: true
    })
    .select('title description duration maxAttempts createdAt')
    .sort({ createdAt: -1 });

    // Check attempts for each quiz
    const quizzesWithAttempts = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptCount = await Attempt.countDocuments({
          quiz: quiz._id,
          user: req.user._id
        });
        
        return {
          ...quiz.toObject(),
          attemptCount,
          canAttempt: attemptCount < quiz.maxAttempts
        };
      })
    );

    res.json({ quizzes: quizzesWithAttempts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
  }
};
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');

// Create new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      duration, 
      maxAttempts, 
      questions,
      password,
      hasPassword,
      allowReview,
      showCorrectAnswers,
      randomizeQuestions,
      randomizeOptions,
      passingScore,
      scheduledPublish,
      deadline
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Quiz title is required' });
    }
    if (!duration || duration < 1) {
      return res.status(400).json({ message: 'Duration must be at least 1 minute' });
    }
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    // Validate questions structure
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || !q.text.trim()) {
        return res.status(400).json({ message: `Question ${i + 1}: Question text is required` });
      }
      if (!q.type) {
        return res.status(400).json({ message: `Question ${i + 1}: Question type is required` });
      }
      if (!q.correctAnswer || !q.correctAnswer.trim()) {
        return res.status(400).json({ message: `Question ${i + 1}: Correct answer is required` });
      }
      if (!q.marks || q.marks < 1) {
        return res.status(400).json({ message: `Question ${i + 1}: Marks must be at least 1` });
      }
      if (q.type === 'mcq' && (!q.options || q.options.length < 2)) {
        return res.status(400).json({ message: `Question ${i + 1}: MCQ requires at least 2 options` });
      }
    }

    const quiz = new Quiz({
      title,
      description,
      duration,
      maxAttempts,
      questions,
      createdBy: req.user._id,
      isPublished: false,
      password: hasPassword ? password : null,
      hasPassword: hasPassword || false,
      allowReview: allowReview !== undefined ? allowReview : true,
      showCorrectAnswers: showCorrectAnswers || false,
      randomizeQuestions: randomizeQuestions || false,
      randomizeOptions: randomizeOptions || false,
      passingScore: passingScore || 50,
      scheduledPublish: scheduledPublish || null,
      deadline: deadline || null
    });

    await quiz.save();

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Quiz creation error:', error);
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
    .select('title description duration maxAttempts createdAt deadline questions hasPassword')
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

// Verify quiz password
exports.verifyQuizPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const quiz = await Quiz.findById(req.params.id);
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.hasPassword) {
      return res.status(400).json({ message: 'This quiz does not require a password' });
    }

    if (quiz.password === password) {
      res.json({ 
        success: true, 
        message: 'Password verified successfully',
        quiz: {
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          duration: quiz.duration,
          questions: quiz.questions
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify password', error: error.message });
  }
};

// Duplicate quiz
exports.duplicateQuiz = async (req, res) => {
  try {
    const originalQuiz = await Quiz.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });

    if (!originalQuiz) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    const duplicatedQuiz = new Quiz({
      title: `${originalQuiz.title} (Copy)`,
      description: originalQuiz.description,
      duration: originalQuiz.duration,
      maxAttempts: originalQuiz.maxAttempts,
      questions: originalQuiz.questions,
      createdBy: req.user._id,
      isPublished: false,
      password: originalQuiz.password,
      hasPassword: originalQuiz.hasPassword,
      allowReview: originalQuiz.allowReview,
      showCorrectAnswers: originalQuiz.showCorrectAnswers,
      randomizeQuestions: originalQuiz.randomizeQuestions,
      randomizeOptions: originalQuiz.randomizeOptions,
      passingScore: originalQuiz.passingScore
    });

    await duplicatedQuiz.save();

    res.status(201).json({
      message: 'Quiz duplicated successfully',
      quiz: duplicatedQuiz
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to duplicate quiz', error: error.message });
  }
};

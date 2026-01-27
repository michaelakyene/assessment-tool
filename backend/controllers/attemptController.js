const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');

// Start a new attempt
exports.startAttempt = async (req, res) => {
  try {
    const { quizId } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!quiz.isPublished) {
      return res.status(403).json({ message: 'Quiz is not available' });
    }

    // Check attempt limit
    const attemptCount = await Attempt.countDocuments({
      quiz: quizId,
      user: req.user._id
    });

    if (attemptCount >= quiz.maxAttempts) {
      return res.status(403).json({ message: 'Maximum attempts reached' });
    }

    // Check if there's an in-progress attempt
    const existingAttempt = await Attempt.findOne({
      quiz: quizId,
      user: req.user._id,
      status: 'in_progress'
    });

    if (existingAttempt) {
      return res.json({
        message: 'Resuming existing attempt',
        attempt: existingAttempt,
        quiz
      });
    }

    // Create new attempt
    const attempt = new Attempt({
      user: req.user._id,
      quiz: quizId,
      attemptNumber: attemptCount + 1,
      startTime: Date.now(),
      status: 'in_progress'
    });

    await attempt.save();

    res.json({
      message: 'Attempt started successfully',
      attempt,
      quiz
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start attempt', error: error.message });
  }
};

// Submit attempt
exports.submitAttempt = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ message: 'Attempt already submitted' });
    }

    const quiz = await Quiz.findById(attempt.quiz);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Calculate scores
    let totalMarks = 0;
    let score = 0;
    const gradedAnswers = [];

    quiz.questions.forEach((question, index) => {
      totalMarks += question.marks;
      
      const userAnswer = answers.find(a => 
        a.questionId.toString() === question._id.toString()
      );

      if (userAnswer) {
        let isCorrect = false;
        let marksObtained = 0;

        if (question.type === 'mcq' || question.type === 'true_false') {
          isCorrect = userAnswer.response === question.correctAnswer;
          marksObtained = isCorrect ? question.marks : 0;
        } else if (question.type === 'short_answer') {
          // For short answer, compare case-insensitive and trimmed
          isCorrect = userAnswer.response.trim().toLowerCase() === 
                     question.correctAnswer.trim().toLowerCase();
          marksObtained = isCorrect ? question.marks : 0;
        }

        score += marksObtained;

        gradedAnswers.push({
          questionId: question._id,
          response: userAnswer.response,
          isCorrect,
          marksObtained
        });
      }
    });

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

    // Update attempt
    attempt.answers = gradedAnswers;
    attempt.endTime = Date.now();
    attempt.totalMarks = totalMarks;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.status = 'completed';

    await attempt.save();

    res.json({
      message: 'Attempt submitted successfully',
      attempt,
      showResults: quiz.showResults
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit attempt', error: error.message });
  }
};

// Get attempt by ID
exports.getAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('quiz', 'title showResults questions');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.user.toString() !== req.user._id.toString() && 
        req.user.role !== 'lecturer') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json({ attempt });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attempt', error: error.message });
  }
};

// Get user's attempts
exports.getUserAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({ user: req.user._id })
      .populate('quiz', 'title duration')
      .sort({ createdAt: -1 });

    res.json({ attempts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch attempts', error: error.message });
  }
};

// Auto-submit on timeout
exports.timeoutAttempt = async (req, res) => {
  try {
    const { attemptId } = req.body;

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.status !== 'in_progress') {
      return res.json({ message: 'Attempt already submitted' });
    }

    attempt.endTime = Date.now();
    attempt.status = 'timeout';

    await attempt.save();

    res.json({
      message: 'Attempt timed out',
      attempt
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to process timeout', error: error.message });
  }
};
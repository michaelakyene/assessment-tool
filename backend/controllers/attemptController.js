const Attempt = require('../models/Attempt');
const Quiz = require('../models/Quiz');
const jwt = require('jsonwebtoken');

const isQuizAccessAllowed = (req, quizId, userId) => {
  const token = req.header('X-Quiz-Access-Token');
  if (!token || !process.env.JWT_SECRET) return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'quiz_access') return false;
    if (decoded.quizId !== String(quizId)) return false;
    if (decoded.userId !== String(userId)) return false;
    return true;
  } catch (error) {
    return false;
  }
};

const sanitizeQuizForAttempt = (quiz, options = {}) => {
  const quizObj = quiz.toObject ? quiz.toObject() : { ...quiz };

  if (quizObj.password) {
    delete quizObj.password;
  }

  if (Array.isArray(quizObj.questions)) {
    quizObj.questions = quizObj.questions.map(q => {
      const questionObj = q.toObject ? q.toObject() : { ...q };
      if (!options.includeCorrectAnswers) {
        delete questionObj.correctAnswer;
      }
      return questionObj;
    });
  }

  return quizObj;
};

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

    const now = new Date();
    if (quiz.scheduledPublish && now < new Date(quiz.scheduledPublish)) {
      return res.status(403).json({ message: 'Quiz is not yet available' });
    }
    if (quiz.deadline && now > new Date(quiz.deadline)) {
      return res.status(403).json({ message: 'Quiz deadline has passed' });
    }

    if (quiz.hasPassword && !isQuizAccessAllowed(req, quiz._id, req.user._id)) {
      return res.status(403).json({
        message: 'Password required to access this quiz',
        requiresPassword: true
      });
    }

    // Check attempt limit - only count COMPLETED attempts
    const attemptCount = await Attempt.countDocuments({
      quiz: quizId,
      user: req.user._id,
      status: 'completed'
    });

    if (attemptCount >= quiz.maxAttempts) {
      return res.status(403).json({ 
        message: `Maximum attempts reached. You have completed ${attemptCount} of ${quiz.maxAttempts} allowed attempts.`,
        attemptsUsed: attemptCount,
        maxAttempts: quiz.maxAttempts
      });
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
        quiz: sanitizeQuizForAttempt(quiz)
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
      quiz: sanitizeQuizForAttempt(quiz)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to start attempt', error: error.message });
  }
};

// Submit attempt
exports.submitAttempt = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    // Validate input
    if (!attemptId || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ 
        message: 'Invalid request. Missing attemptId or answers.' 
      });
    }

    const attempt = await Attempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized access to this attempt' });
    }

    const quiz = await Quiz.findById(attempt.quiz).select(
      'title questions maxAttempts showResults passingScore allowReview showCorrectAnswers duration'
    );
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Double-submission prevention: If already submitted, return the result
    if (attempt.status === 'completed' || attempt.status === 'timeout') {
      return res.json({
        message: 'Attempt already submitted',
        attempt,
        allowReview: quiz.allowReview ?? true,
        showCorrectAnswers: quiz.showCorrectAnswers || false
      });
    }

    if (attempt.status !== 'in_progress') {
      return res.status(400).json({ 
        message: `Cannot submit. Attempt status is ${attempt.status}` 
      });
    }

    const timeLimitMs = (quiz.duration || 0) * 60 * 1000;
    if (attempt.startTime && timeLimitMs > 0) {
      const elapsed = Date.now() - new Date(attempt.startTime).getTime();
      if (elapsed > timeLimitMs) {
        attempt.endTime = new Date();
        attempt.status = 'timeout';
        await attempt.save();
        return res.status(200).json({
          message: 'Attempt timed out',
          attempt: {
            _id: attempt._id,
            status: attempt.status,
            endTime: attempt.endTime
          },
          allowReview: quiz.allowReview ?? true,
          showCorrectAnswers: quiz.showCorrectAnswers || false
        });
      }
    }

    // Validate answers array
    if (answers.length === 0) {
      return res.status(400).json({ 
        message: 'No answers provided. Please answer at least one question.' 
      });
    }

    // Calculate scores
    let totalMarks = 0;
    let score = 0;
    const gradedAnswers = [];

    quiz.questions.forEach((question) => {
      totalMarks += question.marks || 0;
      
      const userAnswer = answers.find(a => {
        // Handle both string and ObjectId comparisons
        const answerId = a.questionId.toString();
        const questionId = question._id.toString();
        return answerId === questionId;
      });

      if (userAnswer && userAnswer.response) {
        let isCorrect = false;
        let marksObtained = 0;
        const response = String(userAnswer.response).trim();

        if (question.type === 'mcq') {
          isCorrect = response === String(question.correctAnswer).trim();
          marksObtained = isCorrect ? (question.marks || 0) : 0;
        } else if (question.type === 'true_false') {
          const normalizedResponse = response.toLowerCase();
          const normalizedCorrect = String(question.correctAnswer).trim().toLowerCase();
          isCorrect = normalizedResponse === normalizedCorrect;
          marksObtained = isCorrect ? (question.marks || 0) : 0;
        } else if (question.type === 'short_answer') {
          // Case-insensitive, trimmed comparison
          const correctAnswer = String(question.correctAnswer || '').trim().toLowerCase();
          const studentAnswer = response.toLowerCase();
          
          // Exact match
          isCorrect = studentAnswer === correctAnswer;
          marksObtained = isCorrect ? (question.marks || 0) : 0;
        }

        score += marksObtained;

        gradedAnswers.push({
          questionId: question._id,
          response,
          isCorrect,
          marksObtained
        });
      } else {
        // No answer provided for this question
        gradedAnswers.push({
          questionId: question._id,
          response: '',
          isCorrect: false,
          marksObtained: 0
        });
      }
    });

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;

    // Update attempt
    attempt.answers = gradedAnswers;
    attempt.endTime = new Date();
    attempt.totalMarks = totalMarks;
    attempt.score = score;
    attempt.percentage = percentage;
    attempt.status = 'completed';

    await attempt.save();

    res.json({
      message: 'Attempt submitted successfully',
      attempt: {
        _id: attempt._id,
        score: attempt.score,
        percentage: attempt.percentage,
        totalMarks: attempt.totalMarks,
        status: attempt.status,
        endTime: attempt.endTime
      },
      allowReview: quiz.allowReview ?? true,
      showCorrectAnswers: quiz.showCorrectAnswers || false
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ 
      message: 'Failed to submit attempt. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get attempt by ID
exports.getAttempt = async (req, res) => {
  try {
    const attempt = await Attempt.findById(req.params.id)
      .populate('quiz', 'title allowReview showCorrectAnswers passingScore questions');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    if (attempt.user.toString() !== req.user._id.toString() && 
        req.user.role !== 'lecturer') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const quiz = attempt.quiz;
    const isLecturer = req.user.role === 'lecturer';
    const allowReview = quiz?.allowReview ?? true;
    const showCorrectAnswers = quiz?.showCorrectAnswers || false;

    if (!isLecturer && !allowReview) {
      const attemptObj = attempt.toObject();
      attemptObj.answers = [];

      if (attemptObj.quiz) {
        attemptObj.quiz = {
          _id: quiz._id,
          title: quiz.title,
          allowReview,
          showCorrectAnswers,
          passingScore: quiz.passingScore,
          questionCount: Array.isArray(quiz.questions) ? quiz.questions.length : 0
        };
      }

      return res.json({ attempt: attemptObj });
    }

    if (!isLecturer && quiz?.questions) {
      quiz.questions = quiz.questions.map(q => {
        const questionObj = q.toObject ? q.toObject() : { ...q };
        if (!showCorrectAnswers) {
          delete questionObj.correctAnswer;
        }
        return questionObj;
      });
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
const Quiz = require('../models/Quiz');
const Attempt = require('../models/Attempt');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const sanitizeQuizForStudent = (quiz) => {
  if (!quiz) return quiz;
  const quizObj = quiz.toObject ? quiz.toObject() : { ...quiz };

  if (quizObj.password) {
    delete quizObj.password;
  }

  if (Array.isArray(quizObj.questions)) {
    quizObj.questions = quizObj.questions.map(q => {
      const { correctAnswer, ...safeQuestion } = q.toObject ? q.toObject() : q;
      return safeQuestion;
    });
  }

  return quizObj;
};

const sanitizeQuizForLecturer = (quiz) => {
  if (!quiz) return quiz;
  const quizObj = quiz.toObject ? quiz.toObject() : { ...quiz };
  if (quizObj.password) {
    delete quizObj.password;
  }
  return quizObj;
};

const isQuizAccessAllowed = (req, quizId) => {
  const token = req.header('X-Quiz-Access-Token');
  if (!token || !process.env.JWT_SECRET) return false;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'quiz_access') return false;
    if (decoded.quizId !== String(quizId)) return false;
    if (decoded.userId !== String(req.user._id)) return false;
    return true;
  } catch (error) {
    return false;
  }
};

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
    if (!duration || duration < 1 || duration > 180) {
      return res.status(400).json({ message: 'Duration must be between 1 and 180 minutes' });
    }
    if (maxAttempts && maxAttempts < 1) {
      return res.status(400).json({ message: 'Max attempts must be at least 1' });
    }
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    // Validate questions structure
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText || !q.questionText.trim()) {
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
      if (q.type === 'multiple_choice' && (!q.options || q.options.length < 2)) {
        return res.status(400).json({ message: `Question ${i + 1}: Multiple choice requires at least 2 options` });
      }
    }

    // Transform questions to match model schema
    const transformedQuestions = questions.map(q => ({
      text: q.questionText,
      type: q.type === 'multiple_choice' ? 'mcq' : q.type,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      marks: q.marks || 1,
      explanation: q.explanation || ''
    }));

    const hashedPassword = hasPassword && password
      ? await bcrypt.hash(password, 10)
      : null;

    const quiz = new Quiz({
      title,
      description,
      duration,
      maxAttempts,
      questions: transformedQuestions,
      createdBy: req.user._id,
      isPublished: false,
      password: hasPassword ? hashedPassword : null,
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
      .select('-password')
      .lean();

    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch quizzes', error: error.message });
  }
};

// Get quiz by ID
exports.getQuizById = async (req, res) => {
  try {
    const startTime = Date.now();
    const quizId = req.params.id;
    const userRole = req.user?.role || 'unknown';
    const userId = req.user?._id || 'unknown';
    
    console.log(`\n🔍 [${new Date().toISOString()}] GET /quizzes/:id REQUEST`)
    console.log(`  Quiz ID: ${quizId}`)
    console.log(`  User ID: ${userId}`)
    console.log(`  User Role: ${userRole}`)
    
    // Quick validation of ObjectId format first
    if (!quizId || quizId.length !== 24 || !/^[0-9a-f]{24}$/i.test(quizId)) {
      console.log(`  ❌ Invalid ID format`)
      return res.status(400).json({ message: 'Invalid quiz ID format' });
    }
    
    // Query with proper MongoDB timeout handling
    let quiz;
    try {
      const queryStart = Date.now();
      const quizObjectId = new mongoose.Types.ObjectId(quizId);
      console.log(`  ⏱️ Starting MongoDB query...`);
      
      quiz = await Quiz.collection.findOne(
        { _id: quizObjectId },
        { maxTimeMS: 15000 }
      );
      
      const queryDuration = Date.now() - queryStart;
      console.log(`  ✅ MongoDB query completed in ${queryDuration}ms`);
    } catch (mongoError) {
      console.error(`  ❌ MongoDB error for quiz ${quizId}:`, mongoError.message);
      if (mongoError.message.includes('maxTimeMS') || mongoError.message.includes('timeout')) {
        return res.status(504).json({
          message: 'Database query timeout - quiz may be too large or busy',
          code: 'QUERY_TIMEOUT'
        });
      }
      throw mongoError;
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Total request time: ${duration}ms for quiz ${quizId}`);
    
    if (!quiz) {
      console.log(`  📭 Quiz not found: ${quizId}`);
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const isLecturerOwner = req.user?.role === 'lecturer' &&
      quiz.createdBy?.toString() === req.user._id.toString();

    if (!isLecturerOwner) {
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

      if (quiz.hasPassword && !isQuizAccessAllowed(req, quiz._id)) {
        return res.status(403).json({
          message: 'Password required to access this quiz',
          requiresPassword: true
        });
      }
    }

    const responseQuiz = isLecturerOwner
      ? sanitizeQuizForLecturer(quiz)
      : sanitizeQuizForStudent(quiz);

    res.json({ quiz: responseQuiz });
  } catch (error) {
    console.error(`❌ Error fetching quiz ${req.params.id}:`, error.message);
    
    if (error.message.includes('timeout')) {
      return res.status(504).json({ 
        message: 'Database query timeout - quiz may be too large or corrupted',
        code: 'QUERY_TIMEOUT'
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch quiz', 
      error: error.message 
    });
  }
};

// Update quiz
exports.updateQuiz = async (req, res) => {
  try {
    // Validate input if provided
    if (req.body.title !== undefined && (!req.body.title || !req.body.title.trim())) {
      return res.status(400).json({ message: 'Quiz title cannot be empty' });
    }
    if (req.body.duration !== undefined && (req.body.duration < 1 || req.body.duration > 180)) {
      return res.status(400).json({ message: 'Duration must be between 1 and 180 minutes' });
    }
    if (req.body.maxAttempts !== undefined && req.body.maxAttempts < 1) {
      return res.status(400).json({ message: 'Max attempts must be at least 1' });
    }
    if (Array.isArray(req.body.questions) && req.body.questions.length === 0) {
      return res.status(400).json({ message: 'At least one question is required' });
    }

    const updateData = { ...req.body, updatedAt: Date.now() };

    if (Array.isArray(req.body.questions)) {
      updateData.questions = req.body.questions.map((q) => ({
        text: q.questionText || q.text || '',
        type: q.type === 'multiple_choice' ? 'mcq' : q.type,
        options: q.options || [],
        correctAnswer: q.correctAnswer || '',
        marks: q.marks || 1,
        explanation: q.explanation || ''
      }));
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'password')) {
      if (req.body.password) {
        updateData.password = await bcrypt.hash(req.body.password, 10);
        updateData.hasPassword = true;
      } else {
        updateData.password = null;
        updateData.hasPassword = false;
      }
    }

    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true, maxTimeMS: 15000 }
    );

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    res.json({
      message: 'Quiz updated successfully',
      quiz: sanitizeQuizForLecturer(quiz)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update quiz', error: error.message });
  }
};

// Delete quiz
exports.deleteQuiz = async (req, res) => {
  try {
    const result = await Quiz.collection.deleteOne({
      _id: new mongoose.Types.ObjectId(req.params.id),
      createdBy: new mongoose.Types.ObjectId(req.user._id)
    }, { maxTimeMS: 15000 });

    if (!result || result.deletedCount === 0) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    // Delete associated attempts
    Attempt.deleteMany({ quiz: req.params.id }).catch((error) => {
      console.warn(`⚠️ Failed to delete attempts for quiz ${req.params.id}:`, error.message);
    });

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete quiz', error: error.message });
  }
};

// Publish/unpublish quiz
exports.togglePublish = async (req, res) => {
  try {
    console.log(`🔄 Toggling publish for quiz: ${req.params.id}`);
    console.log(`📄 Request body:`, req.body);
    
    const result = await Quiz.collection.updateOne(
      { _id: new mongoose.Types.ObjectId(req.params.id), createdBy: new mongoose.Types.ObjectId(req.user._id) },
      { $set: { isPublished: req.body.isPublished } },
      { maxTimeMS: 15000 }
    );
    
    console.log(`📦 Quiz found and updated:`, result?.modifiedCount > 0 ? 'Yes' : 'No');

    if (!result || result.matchedCount === 0) {
      return res.status(404).json({ message: 'Quiz not found or unauthorized' });
    }

    res.json({
      message: `Quiz ${req.body.isPublished ? 'published' : 'unpublished'} successfully`
    });
  } catch (error) {
    console.error(`❌ Error toggling publish for quiz ${req.params.id}:`, error);
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
      quiz: sanitizeQuizForLecturer(quiz),
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
    const now = new Date();
    const quizzes = await Quiz.find({
      isPublished: true,
      $and: [
        {
          $or: [
            { scheduledPublish: null },
            { scheduledPublish: { $lte: now } }
          ]
        },
        {
          $or: [
            { deadline: null },
            { deadline: { $gte: now } }
          ]
        }
      ]
    })
    .select('title description duration maxAttempts createdAt deadline hasPassword allowReview showCorrectAnswers passingScore scheduledPublish questions')
    .sort({ createdAt: -1 });

    // Check attempts for each quiz
    const quizzesWithAttempts = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptCount = await Attempt.countDocuments({
          quiz: quiz._id,
          user: req.user._id
        });
        
        const quizObj = quiz.toObject();
        const questionCount = Array.isArray(quizObj.questions) ? quizObj.questions.length : 0;
        delete quizObj.questions;

        return {
          ...quizObj,
          questionCount,
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

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Server configuration error' });
    }

    let isValid = false;
    if (quiz.password?.startsWith('$2')) {
      isValid = await bcrypt.compare(password, quiz.password);
    } else {
      isValid = quiz.password === password;
      if (isValid) {
        quiz.password = await bcrypt.hash(password, 10);
        await quiz.save();
      }
    }

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    const quizAccessToken = jwt.sign(
      {
        userId: req.user._id,
        quizId: String(quiz._id),
        type: 'quiz_access'
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ 
      success: true, 
      message: 'Password verified successfully',
      accessToken: quizAccessToken
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify password', error: error.message });
  }
};

// Duplicate quiz
exports.duplicateQuiz = async (req, res) => {
  try {
    const originalQuiz = await Quiz.collection.findOne(
      { _id: new mongoose.Types.ObjectId(req.params.id), createdBy: new mongoose.Types.ObjectId(req.user._id) },
      { projection: { title: 1, description: 1, duration: 1, maxAttempts: 1, questions: 1, password: 1, hasPassword: 1, allowReview: 1, showCorrectAnswers: 1, randomizeQuestions: 1, randomizeOptions: 1, passingScore: 1 }, maxTimeMS: 15000 }
    );

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
      quiz: sanitizeQuizForLecturer(duplicatedQuiz)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to duplicate quiz', error: error.message });
  }
};

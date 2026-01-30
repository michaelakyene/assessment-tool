const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Auth validation rules
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens and apostrophes'),
  
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Password must be between 8 and 128 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  
  body('role')
    .optional()
    .isIn(['student', 'lecturer'])
    .withMessage('Role must be either student or lecturer'),
  
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Student ID must contain only uppercase letters, numbers and hyphens'),
  
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Quiz validation rules
const validateQuizCreate = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('duration')
    .isInt({ min: 1, max: 300 })
    .withMessage('Duration must be between 1 and 300 minutes'),
  
  body('maxAttempts')
    .isInt({ min: 1, max: 10 })
    .withMessage('Max attempts must be between 1 and 10'),
  
  body('passingScore')
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  
  body('questions')
    .isArray({ min: 1, max: 100 })
    .withMessage('Quiz must have between 1 and 100 questions'),
  
  body('questions.*.questionText')
    .trim()
    .isLength({ min: 3, max: 500 })
    .withMessage('Question text must be between 3 and 500 characters'),
  
  body('questions.*.type')
    .isIn(['multiple_choice', 'true_false', 'short_answer'])
    .withMessage('Invalid question type'),
  
  body('questions.*.marks')
    .isInt({ min: 1, max: 100 })
    .withMessage('Marks must be between 1 and 100'),
  
  handleValidationErrors
];

// Attempt validation rules
const validateAttemptSubmit = [
  body('attemptId')
    .trim()
    .isMongoId()
    .withMessage('Invalid attempt ID'),
  
  body('answers')
    .isArray({ min: 1 })
    .withMessage('Answers must be provided as an array'),
  
  body('answers.*.questionId')
    .trim()
    .isMongoId()
    .withMessage('Invalid question ID'),
  
  body('answers.*.response')
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Answer response too long (max 1000 characters)'),
  
  handleValidationErrors
];

const validateMongoId = (paramName = 'id') => [
  param(paramName)
    .trim()
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// Sanitize query parameters
const sanitizeQuery = [
  query('page')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Page must be between 1 and 1000')
    .toInt(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
    .toInt(),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .escape()
    .withMessage('Search query too long'),
  
  handleValidationErrors
];

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: errors.array() 
    });
  }
  next();
};

module.exports = {
  validateRequest,
  validateRegister,
  validateLogin,
  validateQuizCreate,
  validateAttemptSubmit,
  validateMongoId,
  sanitizeQuery,
  handleValidationErrors
};

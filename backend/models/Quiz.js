const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer'],
    default: 'mcq'
  },
  options: [String],
  correctAnswer: {
    type: String,
    required: true
  },
  marks: {
    type: Number,
    required: true,
    min: 1
  },
  explanation: String
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  maxAttempts: {
    type: Number,
    default: 1,
    min: 1
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  showResults: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    default: null // Optional password protection
  },
  hasPassword: {
    type: Boolean,
    default: false
  },
  allowReview: {
    type: Boolean,
    default: true // Allow students to review answers after completion
  },
  showCorrectAnswers: {
    type: Boolean,
    default: false // Show correct answers in review
  },
  randomizeQuestions: {
    type: Boolean,
    default: false
  },
  randomizeOptions: {
    type: Boolean,
    default: false
  },
  passingScore: {
    type: Number,
    default: 50, // Percentage
    min: 0,
    max: 100
  },
  scheduledPublish: {
    type: Date,
    default: null
  },
  deadline: {
    type: Date,
    default: null
  },
  questions: [questionSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

quizSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Add indexes for better query performance
quizSchema.index({ createdBy: 1 });
quizSchema.index({ isPublished: 1 });
quizSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
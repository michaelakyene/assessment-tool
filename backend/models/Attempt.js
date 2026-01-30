const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  isCorrect: Boolean,
  marksObtained: Number
});

const attemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    min: 1
  },
  answers: [answerSchema],
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    default: null
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  score: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'timeout'],
    default: 'in_progress'
  },
  timeTaken: Number, // in seconds
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate time taken when attempt ends
attemptSchema.pre('save', function(next) {
  if (this.endTime && this.startTime && !this.timeTaken) {
    this.timeTaken = Math.floor((this.endTime - this.startTime) / 1000);
  }
  next();
});

// Indexes for performance optimization
attemptSchema.index({ quiz: 1, user: 1 });
attemptSchema.index({ quiz: 1, status: 1, createdAt: -1 });
attemptSchema.index({ user: 1, createdAt: -1 });
attemptSchema.index({ status: 1 });

module.exports = mongoose.model('Attempt', attemptSchema);
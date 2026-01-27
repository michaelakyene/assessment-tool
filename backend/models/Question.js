const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

const questionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  text: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['mcq', 'true_false', 'short_answer', 'multiple_select'],
    default: 'mcq',
    required: true
  },
  options: [optionSchema],
  correctAnswer: {
    type: String,
    required: function() {
      return this.type === 'short_answer';
    }
  },
  marks: {
    type: Number,
    required: true,
    min: [1, 'Marks must be at least 1'],
    max: [100, 'Marks cannot exceed 100']
  },
  explanation: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  timeLimit: {
    type: Number, // in seconds
    min: 10,
    max: 600,
    default: 60
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
questionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
questionSchema.index({ quiz: 1, order: 1 });
questionSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);
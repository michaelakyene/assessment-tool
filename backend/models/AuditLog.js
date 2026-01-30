const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    enum: ['ATTEMPT_SUBMISSION', 'QUIZ_CREATED', 'QUIZ_UPDATED', 'QUIZ_DELETED', 'USER_LOGIN'],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  attemptId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attempt',
    required: false
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: false
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    timestamp: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for fast lookups
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ attemptId: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

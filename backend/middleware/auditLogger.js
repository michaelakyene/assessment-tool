/**
 * Audit logging middleware - logs all important actions
 */

const AuditLog = require('../models/AuditLog');

const auditLogger = async (req, res, next) => {
  // Capture the original send method
  const originalSend = res.send;

  res.send = function (data) {
    // Only log successful submissions (200-299 status)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Log submission attempts
      if (req.path.includes('/attempts/submit') && req.method === 'POST') {
        logAttemptSubmission(req, res, data);
      }
      
      // Log quiz creation/updates
      if (req.path.includes('/quizzes') && (req.method === 'POST' || req.method === 'PUT')) {
        logQuizAction(req, res);
      }
    }

    // Call original send method
    res.send = originalSend;
    return res.send(data);
  };

  next();
};

const logAttemptSubmission = async (req, res, data) => {
  try {
    const { attemptId, answers } = req.body;
    const userId = req.user?._id;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const log = new AuditLog({
      action: 'ATTEMPT_SUBMISSION',
      userId,
      attemptId,
      metadata: {
        ipAddress,
        userAgent: req.get('user-agent'),
        answerCount: answers?.length || 0,
        timestamp: new Date()
      }
    });

    await log.save();
  } catch (error) {
    console.error('Audit logging error:', error);
    // Don't throw - logging failure shouldn't break the app
  }
};

const logQuizAction = async (req, res) => {
  try {
    const userId = req.user?._id;
    const quizId = req.params.id || req.body.quizId;
    const ipAddress = req.ip || req.connection.remoteAddress;

    const log = new AuditLog({
      action: req.method === 'POST' ? 'QUIZ_CREATED' : 'QUIZ_UPDATED',
      userId,
      quizId,
      metadata: {
        ipAddress,
        userAgent: req.get('user-agent'),
        timestamp: new Date()
      }
    });

    await log.save();
  } catch (error) {
    console.error('Audit logging error:', error);
  }
};

module.exports = auditLogger;

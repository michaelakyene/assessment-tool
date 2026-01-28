module.exports = {
  Attempt: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      user: { type: 'string', example: '507f1f77bcf86cd799439011' },
      quiz: { type: 'string', example: '507f1f77bcf86cd799439011' },
      attemptNumber: { type: 'number', example: 1 },
      answers: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            questionId: { type: 'string' },
            response: { type: 'string' },
            isCorrect: { type: 'boolean' },
            marksObtained: { type: 'number' }
          }
        }
      },
      startTime: { type: 'string', format: 'date-time' },
      endTime: { type: 'string', format: 'date-time' },
      totalMarks: { type: 'number', example: 100 },
      score: { type: 'number', example: 75 },
      percentage: { type: 'number', example: 75 },
      passed: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time' }
    }
  },
  SubmitAnswerRequest: {
    type: 'object',
    required: ['quizId', 'answers'],
    properties: {
      quizId: { type: 'string', example: '507f1f77bcf86cd799439011' },
      answers: {
        type: 'array',
        items: {
          type: 'object',
          required: ['questionId', 'response'],
          properties: {
            questionId: { type: 'string' },
            response: { type: 'string' }
          }
        }
      }
    }
  }
};

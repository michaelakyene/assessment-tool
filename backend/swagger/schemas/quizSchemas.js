module.exports = {
  Quiz: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      title: { type: 'string', example: 'Mathematics Quiz 1' },
      description: { type: 'string', example: 'Basic algebra concepts' },
      createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
      duration: { type: 'number', example: 30 },
      maxAttempts: { type: 'number', example: 3 },
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            text: { type: 'string' },
            type: { type: 'string', enum: ['mcq', 'true_false', 'short_answer'] },
            options: { type: 'array', items: { type: 'string' } },
            correctAnswer: { type: 'string' },
            marks: { type: 'number' },
            explanation: { type: 'string' }
          }
        }
      },
      isPublished: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },
  CreateQuizRequest: {
    type: 'object',
    required: ['title', 'duration', 'questions'],
    properties: {
      title: { type: 'string', example: 'Mathematics Quiz 1' },
      description: { type: 'string', example: 'Basic algebra concepts' },
      duration: { type: 'number', example: 30 },
      maxAttempts: { type: 'number', example: 3 },
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            text: { type: 'string' },
            type: { type: 'string', enum: ['mcq', 'true_false', 'short_answer'] },
            options: { type: 'array', items: { type: 'string' } },
            correctAnswer: { type: 'string' },
            marks: { type: 'number' }
          }
        }
      }
    }
  }
};

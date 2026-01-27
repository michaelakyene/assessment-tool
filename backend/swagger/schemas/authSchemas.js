module.exports = {
  User: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', example: 'john@example.com' },
      role: { type: 'string', enum: ['student', 'lecturer'], example: 'student' },
      studentId: { type: 'string', example: 'S123456' },
      createdAt: { type: 'string', format: 'date-time' }
    }
  },
  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', example: 'john@example.com' },
      password: { type: 'string', example: 'password123' }
    }
  },
  RegisterRequest: {
    type: 'object',
    required: ['name', 'email', 'password', 'role'],
    properties: {
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', example: 'john@example.com' },
      password: { type: 'string', example: 'password123' },
      role: { type: 'string', enum: ['student', 'lecturer'], example: 'student' },
      studentId: { type: 'string', example: 'S123456' }
    }
  }
};
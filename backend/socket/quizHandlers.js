const activeQuizzes = new Map();

module.exports = {
  joinQuiz: (socket, { quizId, userId }) => {
    const room = `quiz-${quizId}`;
    socket.join(room);
    
    if (!activeQuizzes.has(quizId)) {
      activeQuizzes.set(quizId, new Set());
    }
    activeQuizzes.get(quizId).add(userId);
    
    socket.to(room).emit('student-joined', { userId });
    console.log(`User ${userId} joined quiz ${quizId}`);
  },

  leaveQuiz: (socket, { quizId, userId }) => {
    const room = `quiz-${quizId}`;
    socket.leave(room);
    
    if (activeQuizzes.has(quizId)) {
      activeQuizzes.get(quizId).delete(userId);
      if (activeQuizzes.get(quizId).size === 0) {
        activeQuizzes.delete(quizId);
      }
    }
  },

  updateProgress: (socket, { quizId, userId, progress }) => {
    const room = `quiz-${quizId}`;
    socket.to(room).emit('progress-update', { userId, progress });
  },

  quizSubmitted: (socket, { quizId, userId, score }) => {
    const room = `quiz-${quizId}`;
    socket.to(room).emit('quiz-completed', { userId, score });
  },

  handleDisconnect: (socket) => {
    // Clean up any quiz rooms the socket was in
    activeQuizzes.forEach((users, quizId) => {
      if (users.has(socket.userId)) {
        users.delete(socket.userId);
        if (users.size === 0) {
          activeQuizzes.delete(quizId);
        }
      }
    });
  }
};
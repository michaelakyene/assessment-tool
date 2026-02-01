const socketIO = require('socket.io');
const quizHandlers = require('./quizHandlers');
const notificationHandlers = require('./notificationHandlers');

module.exports = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.on('connection', (socket) => {

    // Quiz room handlers
    socket.on('join-quiz', (data) => quizHandlers.joinQuiz(socket, data));
    socket.on('leave-quiz', (data) => quizHandlers.leaveQuiz(socket, data));
    socket.on('quiz-progress', (data) => quizHandlers.updateProgress(socket, data));
    socket.on('quiz-submitted', (data) => quizHandlers.quizSubmitted(socket, data));

    // Notification handlers
    socket.on('subscribe-notifications', (data) => notificationHandlers.subscribe(socket, data));
    socket.on('mark-read', (data) => notificationHandlers.markAsRead(socket, data));

    socket.on('disconnect', () => {
      quizHandlers.handleDisconnect(socket);
    });
  });

  return io;
};
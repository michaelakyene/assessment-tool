import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket) return;

    // Get socket server URL from environment or use current domain
    const socketURL = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : window.location.origin;

    this.socket = io(socketURL, {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinQuiz(quizId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-quiz', { quizId, userId });
    }
  }

  leaveQuiz(quizId, userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-quiz', { quizId, userId });
    }
  }

  updateProgress(quizId, userId, progress) {
    if (this.socket && this.isConnected) {
      this.socket.emit('quiz-progress', { quizId, userId, progress });
    }
  }

  subscribeToEvent(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  unsubscribeFromEvent(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

export default new SocketService();
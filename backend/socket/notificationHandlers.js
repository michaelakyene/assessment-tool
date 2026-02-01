const Notification = require('../models/Notification');
const User = require('../models/User');

module.exports = {
  subscribe: async (socket, { userId }) => {
    try {
      socket.userId = userId;
      socket.join(`user-${userId}`);
      
      // Send unread notifications
      const notifications = await Notification.find({
        user: userId,
        read: false
      }).sort({ createdAt: -1 }).limit(10);
      
      if (notifications.length > 0) {
        socket.emit('notifications', notifications);
      }
    } catch (error) {
    }
  },

  markAsRead: async (socket, { notificationId }) => {
    try {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
    } catch (error) {
    }
  },

  sendNotification: async (io, { userId, type, title, message, data }) => {
    try {
      const notification = new Notification({
        user: userId,
        type,
        title,
        message,
        data,
        read: false
      });

      await notification.save();

      // Emit to specific user room
      io.to(`user-${userId}`).emit('new-notification', notification);
      
      return notification;
    } catch (error) {
      throw error;
    }
  },

  sendBulkNotifications: async (io, { userIds, type, title, message, data }) => {
    try {
      const notifications = [];
      
      for (const userId of userIds) {
        const notification = new Notification({
          user: userId,
          type,
          title,
          message,
          data,
          read: false
        });
        
        await notification.save();
        notifications.push(notification);
        
        // Emit to each user
        io.to(`user-${userId}`).emit('new-notification', notification);
      }
      
      return notifications;
    } catch (error) {
      throw error;
    }
  }
};
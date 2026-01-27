const Notification = require('../models/Notification');
const User = require('../models/User');

module.exports = {
  subscribe: async (socket, { userId }) => {
    try {
      socket.userId = userId;
      socket.join(`user-${userId}`);
      
      console.log(`User ${userId} subscribed to notifications`);
      
      // Send unread notifications
      const notifications = await Notification.find({
        user: userId,
        read: false
      }).sort({ createdAt: -1 }).limit(10);
      
      if (notifications.length > 0) {
        socket.emit('notifications', notifications);
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  },

  markAsRead: async (socket, { notificationId }) => {
    try {
      await Notification.findByIdAndUpdate(notificationId, { read: true });
      console.log(`Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error('Error marking notification as read:', error);
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
      
      console.log(`Notification sent to user ${userId}: ${title}`);
      
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
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
      
      console.log(`Bulk notifications sent to ${userIds.length} users: ${title}`);
      
      return notifications;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }
};
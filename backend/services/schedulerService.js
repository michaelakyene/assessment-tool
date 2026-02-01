const cron = require('node-cron');
const Quiz = require('../models/Quiz');

class SchedulerService {
  constructor() {
    this.tasks = [];
  }

  // Start the scheduler - runs every minute
  start() {
    console.log('📅 Quiz scheduler started');

    // Check every minute for quizzes that need to be auto-published or expired
    const task = cron.schedule('* * * * *', async () => {
      await this.checkScheduledPublishes();
      await this.checkDeadlines();
    });

    this.tasks.push(task);
    
    // Run immediately on startup
    this.checkScheduledPublishes();
    this.checkDeadlines();
  }

  // Auto-publish quizzes when scheduledPublish time is reached
  async checkScheduledPublishes() {
    try {
      const now = new Date();
      
      // Find quizzes that should be published now
      const quizzesToPublish = await Quiz.find({
        isPublished: false,
        scheduledPublish: { $lte: now, $ne: null }
      });

      if (quizzesToPublish.length > 0) {
        console.log(`📢 Auto-publishing ${quizzesToPublish.length} quiz(es)`);
        
        for (const quiz of quizzesToPublish) {
          quiz.isPublished = true;
          await quiz.save();
          console.log(`✅ Auto-published quiz: ${quiz.title} (ID: ${quiz._id})`);
        }
      }
    } catch (error) {
      console.error('❌ Error in checkScheduledPublishes:', error);
    }
  }

  // Auto-unpublish quizzes when deadline is reached
  async checkDeadlines() {
    try {
      const now = new Date();
      
      // Find published quizzes that have passed their deadline
      const expiredQuizzes = await Quiz.find({
        isPublished: true,
        deadline: { $lt: now, $ne: null }
      });

      if (expiredQuizzes.length > 0) {
        console.log(`⏰ Auto-unpublishing ${expiredQuizzes.length} expired quiz(es)`);
        
        for (const quiz of expiredQuizzes) {
          quiz.isPublished = false;
          await quiz.save();
          console.log(`🔒 Auto-unpublished expired quiz: ${quiz.title} (ID: ${quiz._id})`);
        }
      }
    } catch (error) {
      console.error('❌ Error in checkDeadlines:', error);
    }
  }

  // Stop all scheduled tasks
  stop() {
    this.tasks.forEach(task => task.stop());
    console.log('📅 Quiz scheduler stopped');
  }
}

module.exports = new SchedulerService();

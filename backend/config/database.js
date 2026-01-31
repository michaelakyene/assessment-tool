const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/assessment_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      retryWrites: true,
      retryReads: true,
      family: 4 // Force IPv4
    });
    console.log('✅ MongoDB Connected Successfully');
    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    if (retries > 0) {
      const delay = (6 - retries) * 2000; // Exponential backoff: 2s, 4s, 6s, 8s, 10s
      console.log(`🔄 Retrying connection in ${delay/1000}s... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), delay);
    } else {
      console.error('❌ MongoDB connection failed after all retries');
      // Don't exit - let Heroku restart the dyno
    }
  }
};

module.exports = connectDB;
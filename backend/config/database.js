const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  try {
    const startTime = Date.now();
    console.log('🔗 Connecting to MongoDB Atlas...');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/assessment_db', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 100,
      minPoolSize: 20,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      waitQueueTimeoutMS: 120000,
      retryWrites: true,
      retryReads: true,
      family: 4, // Force IPv4
      heartbeatFrequencyMS: 10000,
      socketKeepAliveMS: 45000,
      ssl: true,
      authSource: 'admin',
      appName: 'student-assessment-api'
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ MongoDB Connected Successfully (${duration}ms)`);
    
    // Warm up the connection pool by doing a test query
    const testStart = Date.now();
    await mongoose.connection.db.collection('quizzes').countDocuments({});
    const testDuration = Date.now() - testStart;
    console.log(`✅ Connection pool warmed up (${testDuration}ms)`);
    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    
    if (retries > 0) {
      const delay = (6 - retries) * 3000; // Exponential backoff: 3s, 6s, 9s, 12s, 15s
      console.log(`🔄 Retrying connection in ${delay/1000}s... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), delay);
    } else {
      console.error('❌ MongoDB connection failed after all retries');
      // Don't exit - let Heroku restart the dyno
    }
  }
};

module.exports = connectDB;
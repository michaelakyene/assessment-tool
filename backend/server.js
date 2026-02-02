const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const http = require('http');
require('dotenv').config();

const validateEnv = require('./config/validateEnv');
const sanitizeInput = require('./middleware/sanitizeInput');

const authRoutes = require('./routes/authRoutes');
const quizRoutes = require('./routes/quizRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const swaggerSpec = require('./swagger/swaggerConfig');
const swaggerUi = require('swagger-ui-express');
const socketServer = require('./socket/socketServer');
const schedulerService = require('./services/schedulerService');

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  console.error('Environment validation failed:', error.message);
  process.exit(1);
}

const app = express();
const server = http.createServer(app);
const io = socketServer(server);

// Trust proxy - Required for Heroku
app.set('trust proxy', 1);

// Middleware - Performance & Security
app.use(helmet());
app.use(compression({ level: 6, threshold: 1000 }));

// Enhanced CORS configuration with whitelist
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) 
  : [process.env.FRONTEND_URL || 'http://localhost:5173'];

console.log('🔒 Allowed CORS origins:', allowedOrigins);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked origin: ${origin}`);
      console.warn(`   Allowed origins:`, allowedOrigins);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Quiz-Access-Token'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 600 // Cache preflight for 10 minutes
}));

// Data sanitization
app.use(sanitizeInput);

// Rate limiting - Global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: false
});
app.use('/api/', limiter);

// Authentication rate limiting - Strict
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: false
});

// Quiz attempts rate limiting - Prevent abuse
const attemptLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: 'Too many attempts, please wait before trying again',
  standardHeaders: false,
  skip: (req) => req.method !== 'POST'
});

// Quiz password verification rate limiting
const quizPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many password attempts, please try again later',
  standardHeaders: false
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser - Required for refresh tokens
app.use(cookieParser());

// Static files (for uploads)
app.use('/uploads', express.static('uploads'));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Student Assessment System API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      docs: '/api-docs',
      api: '/api/*'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/quizzes/:id/verify-password', quizPasswordLimiter);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptLimiter, attemptRoutes);
app.use('/api/analytics', analyticsRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/assessment_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  // Start the scheduler service after DB connection
  schedulerService.start();
})
.catch(err => console.error('❌ MongoDB connection error:', err));

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
});

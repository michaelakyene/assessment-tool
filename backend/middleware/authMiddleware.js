const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    console.log(`\n📨 [${new Date().toISOString()}] ${req.method} ${req.path}`)
    console.log(`  Headers: Authorization=${req.header('Authorization')?.substring(0, 20)}...`)
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log(`  ❌ No token provided`)
      return res.status(401).json({ message: 'No authentication token provided' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`  ✅ Token verified for user: ${decoded.userId}`)
    
    // Validate token type
    if (decoded.type && decoded.type !== 'access') {
      console.log(`  ❌ Invalid token type: ${decoded.type}`)
      return res.status(401).json({ message: 'Invalid token type' });
    }

    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log(`  ❌ User not found`)
      return res.status(401).json({ message: 'User not found or deactivated' });
    }

    console.log(`  ✅ User found: ${user.email} (${user.role})`)
    req.user = user;
    req.token = token;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error(`  ❌ Auth error:`, error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired - please login again', code: 'TOKEN_EXPIRED' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token', code: 'INVALID_TOKEN' });
    }
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Authentication failed', error: error.message });
  }
};

const roleMiddleware = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      console.warn(`Access denied - User: ${req.user.email}, Role: ${req.user.role}, Required: ${roles.join(',')}, IP: ${req.ip}`);
      return res.status(403).json({ message: 'Access denied - insufficient permissions' });
    }
    next();
  };
};

module.exports = { authMiddleware, roleMiddleware };
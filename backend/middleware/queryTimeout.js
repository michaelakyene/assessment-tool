// Query timeout middleware - Ensure MongoDB queries don't exceed time limits
module.exports = (req, res, next) => {
  // Attach abort controller to request for query cancellation
  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    console.warn(`⚠️ Query timeout: ${req.method} ${req.path}`);
    abortController.abort();
    // Send early response before Heroku cuts us off
    if (!res.headersSent) {
      res.status(503).json({
        message: 'Request timeout',
        code: 'REQUEST_TIMEOUT'
      });
    }
  }, 18000); // 18 second timeout for DB queries (Heroku has 30s limit)
  
  req.queryTimeout = timeout;
  req.abortSignal = abortController.signal;
  
  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  
  next();
};

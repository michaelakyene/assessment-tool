// Query timeout middleware - Ensure MongoDB queries don't exceed time limits
module.exports = (req, res, next) => {
  // Attach abort controller to request for query cancellation
  const abortController = new AbortController();
  const timeout = setTimeout(() => {
    console.warn(`⚠️ Query timeout: ${req.method} ${req.path}`);
    abortController.abort();
  }, 20000); // 20 second timeout for DB queries
  
  req.queryTimeout = timeout;
  req.abortSignal = abortController.signal;
  
  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));
  
  next();
};

const isProduction = process.env.NODE_ENV === 'production';

const errorHandler = (err, req, res, next) => {
  // Always log the full error server-side for debugging
  console.error(`[API Error] ${req.method} ${req.originalUrl}:`, err);

  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    success: false,
    // In production: generic message only — never expose implementation details to clients
    message: isProduction ? 'An unexpected error occurred. Please try again.' : (err.message || 'Internal Server Error'),
    // Stack traces only in development
    ...(isProduction ? {} : { stack: err.stack })
  });
};

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { errorHandler, asyncHandler };

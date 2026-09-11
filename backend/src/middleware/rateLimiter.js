// In-memory token bucket rate limiter with instance-level isolation
const rateLimiter = (options = { windowMs: 15 * 60 * 1000, maxRequests: 100 }) => {
  const instanceMap = new Map();

  // Periodically clean up expired entries to avoid memory growth
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of instanceMap.entries()) {
      if (now > record.resetTime) {
        instanceMap.delete(key);
      }
    }
  }, Math.max(options.windowMs, 60000));
  
  // Unref timer so it doesn't prevent Node process from gracefully exiting
  if (cleanupInterval.unref) cleanupInterval.unref();

  return (req, res, next) => {
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    if (!instanceMap.has(clientIp)) {
      instanceMap.set(clientIp, { count: 1, resetTime: now + options.windowMs });
      return next();
    }

    const record = instanceMap.get(clientIp);

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + options.windowMs;
      return next();
    }

    record.count++;

    if (record.count > options.maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests from this IP. Please try again after 15 minutes.'
      });
    }

    next();
  };
};

module.exports = { rateLimiter };

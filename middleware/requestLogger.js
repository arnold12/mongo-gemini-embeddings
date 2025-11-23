import logger from '../utils/logger.js';

/**
 * Request logging middleware
 * Logs all HTTP requests in JSON format
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = req.headers['x-request-id'] || `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Attach request ID to request object for use in other middleware/controllers
  req.id = requestId;

  // Log request start
  logger.info({
    type: 'http_request_start',
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId,
  });

  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const responseTime = Date.now() - startTime;
    
    // Log request completion
    logger.logRequest(req, res, responseTime);
    
    return originalJson(body);
  };

  next();
};


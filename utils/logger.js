import winston from 'winston';

const { combine, timestamp, errors, json } = winston.format;

// Custom format for JSON logging
const jsonFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  errors({ stack: true }),
  json()
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  defaultMeta: {
    service: 'mongo-gemini-embeddings',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: jsonFormat,
    }),
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: jsonFormat,
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: jsonFormat,
    }),
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log', format: jsonFormat }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log', format: jsonFormat }),
  ],
});

// Helper methods for structured logging
logger.logRequest = (req, res, responseTime) => {
  logger.info({
    type: 'http_request',
    method: req.method,
    path: req.path,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.id || req.headers['x-request-id'],
  });
};

logger.logError = (error, context = {}) => {
  logger.error({
    type: 'error',
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

logger.logInfo = (message, meta = {}) => {
  logger.info({
    type: 'info',
    message,
    ...meta,
  });
};

logger.logWarning = (message, meta = {}) => {
  logger.warn({
    type: 'warning',
    message,
    ...meta,
  });
};

logger.logDebug = (message, meta = {}) => {
  logger.debug({
    type: 'debug',
    message,
    ...meta,
  });
};

export default logger;


const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define level colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define log transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
  }),
  
  // Error log file transport
  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json()
    ),
  }),
  
  // Combined log file transport
  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.uncolorize(),
      winston.format.json()
    ),
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
});

// Add request logging middleware
exports.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
    );
  });
  
  next();
};

// Add error logging middleware
exports.errorLogger = (err, req, res, next) => {
  logger.error(err.stack);
  next(err);
};

// Log database operations
exports.dbLogger = {
  logQuery: (query, duration) => {
    logger.debug(`DB Query (${duration}ms): ${query}`);
  },
  
  logError: (error) => {
    logger.error('Database Error:', error);
  },
};

// Log security events
exports.securityLogger = {
  logAuthAttempt: (user, success) => {
    const message = success
      ? `Successful login: ${user.email}`
      : `Failed login attempt: ${user.email}`;
    logger.info(message);
  },
  
  logAuthFailure: (error) => {
    logger.warn('Authentication Error:', error);
  },
};

// Log performance metrics
exports.performanceLogger = {
  logApiResponse: (endpoint, duration) => {
    logger.debug(`API Response Time - ${endpoint}: ${duration}ms`);
  },
  
  logCacheHit: (key) => {
    logger.debug(`Cache Hit: ${key}`);
  },
  
  logCacheMiss: (key) => {
    logger.debug(`Cache Miss: ${key}`);
  },
};

// Log business events
exports.businessLogger = {
  logOrder: (order) => {
    logger.info(`New Order: #${order._id}, Amount: $${order.totalAmount}`);
  },
  
  logPayment: (payment) => {
    logger.info(
      `Payment Received: $${payment.amount}, Method: ${payment.method}`
    );
  },
  
  logShipment: (shipment) => {
    logger.info(
      `Order Shipped: #${shipment.orderId}, Tracking: ${shipment.trackingNumber}`
    );
  },
};

// Export logger instance
module.exports = {
  logger,
  ...exports,
}; 
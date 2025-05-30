const winston = require('winston');

const logger = winston.createLogger({
  level: 'silly',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),  // 提高到毫秒级精度
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${level.toUpperCase()}] [${timestamp}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/winston.log' })
  ]
});

module.exports = logger;
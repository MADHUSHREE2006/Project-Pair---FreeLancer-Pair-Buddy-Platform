import winston from 'winston'

const { combine, timestamp, colorize, printf, json } = winston.format

const devFormat = combine(
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, message, timestamp, ...meta }) => {
    const extra = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : ''
    return `${timestamp} [${level}] ${message}${extra}`
  })
)

const prodFormat = combine(timestamp(), json())

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
         new winston.transports.File({ filename: 'logs/combined.log' })]
      : []),
  ],
})

// Request logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'
    logger[level](`${req.method} ${req.path} ${res.statusCode} ${ms}ms`, {
      ip: req.ip, userAgent: req.get('user-agent')?.slice(0, 60),
    })
  })
  next()
}

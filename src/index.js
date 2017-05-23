import moment from 'moment'
import winston from 'winston'

const TIMESTAMP_FORMAT = 'HH:mm:ss.SSS'

const logger = new winston.Logger()
  .add(winston.transports.Console, {
    timestamp: () => `[${moment.utc().format(TIMESTAMP_FORMAT)}]`,
    colorize: true,
    prettyPrint: true,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  })

logger.debug(`Token: ${process.env.SLACK_BOT_TOKEN}`)
logger.info('Hello world!')

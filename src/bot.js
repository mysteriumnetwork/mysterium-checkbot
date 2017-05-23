import moment from 'moment'
import { RtmClient, CLIENT_EVENTS } from '@slack/client'
import winston from 'winston'

const TIMESTAMP_FORMAT = 'HH:mm:ss.SSS'

const logger = new winston.Logger()
  .add(winston.transports.Console, {
    timestamp: () => `[${moment.utc().format(TIMESTAMP_FORMAT)}]`,
    colorize: true,
    prettyPrint: true,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  })

// Initialize the real-time messaging client (RTM)
const botToken = process.env.SLACK_BOT_TOKEN || ''
const botChannel = process.env.SLACK_BOT_CHANNEL || ''
const rtm = new RtmClient(botToken)

rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (startData) => {
  logger.info('RTM client has authenticated successuflly.')
  logger.info('Available channels:')
  startData.channels.forEach((channel) => {
    logger.info(`  #${channel.name} (member = ${channel.is_member ? 'yes' : 'no'})`)
  })
})

rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, () => {
  logger.info('RTM client is ready to send messages.')
})

// Start the RTM client
logger.info('Connecting to Slack...')
rtm.start()

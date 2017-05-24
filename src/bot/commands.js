import util from 'util'

import Docker from 'dockerode'
import uniq from 'lodash/uniq'

import { getContainerLogs, parseWanIP, redactIPAddress } from './helpers'
import {
  HELP_TEXT,
  MULTI_NODE_SUCCESS_SUMMARY,
  MULTI_NODE_WARNING_SUMMARY,
  NODE_AVAILABLE_SUMMARY,
  NODE_AVAILABLE_MESSAGE,
  NODE_UNREACHABLE_SUMMARY,
  NODE_UNREACHABLE_MESSAGE,
  NODE_TUNNEL_FAILED_SUMMARY,
  NODE_TUNNEL_FAILED_MESSAGE,
  NODE_NO_INTERNET_ACCESS_SUMMARY,
  NODE_NO_INTERNET_ACCESS_MESSAGE,
  NODE_CONNECTION_TIMEOUT_SUMMARY,
  NODE_CONNECTION_TIMEOUT_MESSAGE,
  NODE_DEFAULT_ERROR_SUMMARY,
  NODE_DEFAULT_ERROR_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE
} from './strings'

const NODE_KEY_REGEX = /^[0-9a-z-_]{1,16}$/i
const GOOGLE_DNS_SERVERS = ['8.8.8.8', '8.8.4.4']
const CAPABILITY_NET_ADMIN = 'NET_ADMIN'
const TIMEOUT_SEC = parseInt(process.env.TIMEOUT_SECONDS, 10) || 30

async function checkNodeAvailability(nodeKey) {
  const docker = new Docker()
  let container

  // Run the docker container
  try {
    container = await docker.run(process.env.CLIENT_IMAGE_NAME, null, null, {
      Tty: true,
      Env: [
        `NODE=${nodeKey}`,
        `TIMEOUT=${TIMEOUT_SEC}`
      ],
      HostConfig: {
        Dns: GOOGLE_DNS_SERVERS,
        CapAdd: CAPABILITY_NET_ADMIN,
      }
    })

    // Wait for the container to finish and get the exit code, logs, and WAN IP
    await container.wait()
    const exitCode = container.output.StatusCode
    const logs = await getContainerLogs(container)
    const wanIPAddress = await parseWanIP(logs)

    // Return the exit code and WAN IP adddress (on success)
    return { nodeKey, exitCode, wanIPAddress }
  } finally {
    // Make sure to remove the container
    if (container) {
      await container.remove()
    }
  }
}

export async function performNodeCheck(ctx, node) {
  const { client, user, channel, logger } = ctx
  const nodeKey = node.toLowerCase().trim()

  // Notify user the node check will begin soon
  logger.debug(`${user.name} requested a node check for '${nodeKey}'.`)
  client.sendMessage(`<@${user.id}>: :hourglass: Checking the availability of node \`${nodeKey}\`...`, channel.id)

  try {
    const result = await checkNodeAvailability(nodeKey)

    // Based on the exit code, notify the user
    switch (result.exitCode) {
      // Report success and a redacted version of the WAN IP address
      case 0: {
        const redactedIPAddress = redactIPAddress(result.wanIPAddress)
        const message = util.format(NODE_AVAILABLE_MESSAGE, user.id, nodeKey, redactedIPAddress)
        client.sendMessage(message, channel.id)
        break
      }
      // Exit code 1 - Unable to establish mysterium client connection
      case 1: {
        const message = util.format(NODE_UNREACHABLE_MESSAGE, user.id, nodeKey)
        client.sendMessage(message, channel.id)
        break
      }
      // Exit code 2 - Unable to create VPN tunnel session
      case 2: {
        const message = util.format(NODE_TUNNEL_FAILED_MESSAGE, user.id, nodeKey)
        client.sendMessage(message, channel.id)
        break
      }
      // Exit code 3 or 7 - No WAN or cURL connect failure
      case 3:
      case 7: {
        const message = util.format(NODE_NO_INTERNET_ACCESS_MESSAGE, user.id, nodeKey)
        client.sendMessage(message, channel.id)
        break
      }
      // Exit code 28 - cURL timeout
      case 28: {
        const message = util.format(NODE_CONNECTION_TIMEOUT_MESSAGE, user.id, nodeKey, TIMEOUT_SEC)
        client.sendMessage(message, channel.id)
        break
      }
      // Exit code ? - Other errors
      default: {
        const message = util.format(NODE_DEFAULT_ERROR_MESSAGE, user.id, nodeKey, result.exitCode)
        client.sendMessage(message, channel.id)
        break
      }
    }
  } catch (err) {
    // Report error to the chat
    logger.error('Unable to perform node check:', err)
    const message = util.format(UNEXPECTED_ERROR_MESSAGE, user.id, err.message)
    client.sendMessage(message, channel.id)
  }
}

export async function performMultiNodeCheck(ctx, nodes) {
  const { client, user, channel, logger } = ctx
  let nodeKeys = nodes.split(/,|\s/i)
    .map(nodeKey => nodeKey.toLowerCase().trim())
    .filter(nodeKey => NODE_KEY_REGEX.test(nodeKey))

  // De-dupe any keys
  nodeKeys = uniq(nodeKeys)

  // If no valid nodes, abort with error
  if (!nodeKeys.length) {
    return client.sendMessage(`<@${user.id}>: :thinking_face: No valid node names were found.`, channel.id)
  }

  // If only a single node is requested, fallback to using single node lookup instead
  if (nodeKeys.length === 1) {
    return performNodeCheck(ctx, nodeKeys[0])
  }

  // If more than 5 unique nodes, abort with error
  if (nodeKeys.length > 5) {
    return client.sendMessage(`<@${user.id}>: :sweat_smile: Sorry, multiple node checking is limited to 5 nodes per request.`, channel.id)
  }

  // Notify user the multi-node check will begin soon
  logger.debug(`${user.name} requested a multi-node check for ${JSON.stringify(nodeKeys)}.`)
  const formattedNodeKeys = nodeKeys.map(key => `\`${key}\``)
  client.sendMessage(`<@${user.id}>: :hourglass: Checking the availability of nodes [${formattedNodeKeys.join(' ')}]...`, channel.id)

  try {
    // Perform all node checks concurrently and wait for results
    const nodeChecks = nodeKeys.map(key => checkNodeAvailability(key))
    const results = await Promise.all(nodeChecks)

    // Map results to intelligible summaries
    const summaries = results.map((result) => {
      switch (result.exitCode) {
        case 0: {
          const redactedIPAddress = redactIPAddress(result.wanIPAddress)
          return util.format(NODE_AVAILABLE_SUMMARY, result.nodeKey, redactedIPAddress)
        }
        case 1:
          return util.format(NODE_UNREACHABLE_SUMMARY, result.nodeKey)
        case 2:
          return util.format(NODE_TUNNEL_FAILED_SUMMARY, result.nodeKey)
        case 3:
        case 7:
          return util.format(NODE_NO_INTERNET_ACCESS_SUMMARY, result.nodeKey)
        case 28:
          return util.format(NODE_CONNECTION_TIMEOUT_SUMMARY, result.nodeKey, TIMEOUT_SEC)
        default:
          return util.format(NODE_DEFAULT_ERROR_SUMMARY, result.nodeKey, result.exitCode)
      }
    })

    // Format the summaries and send to the user
    const formattedSummaries = summaries.map(summary => `> • ${summary}`)
    const headerMessage = results.every(r => r.StatusCode === 0)
      ? MULTI_NODE_SUCCESS_SUMMARY
      : MULTI_NODE_WARNING_SUMMARY
    const message = util.format(headerMessage, user.id, formattedSummaries.join('\n'))
    client.sendMessage(message, channel.id)

  } catch (err) {
    // Report error to the chat
    logger.error('Unable to perform multi-node check:', err)
    const message = util.format(UNEXPECTED_ERROR_MESSAGE, user.id, err.message)
    client.sendMessage(message, channel.id)
  }
}

export async function showHelpText(ctx) {
  const { client, user, channel, logger } = ctx
  logger.debug(`${user.name} requested help text.`)

  // Send help text to chat
  client.sendMessage(HELP_TEXT, channel.id)
}

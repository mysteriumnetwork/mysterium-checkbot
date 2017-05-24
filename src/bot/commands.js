import util from 'util'
import Docker from 'dockerode'

import { getContainerLogs, parseWanIP, redactIPAddress } from './helpers'

const GOOGLE_DNS_SERVERS = ['8.8.8.8', '8.8.4.4']
const CAPABILITY_NET_ADMIN = 'NET_ADMIN'
const TIMEOUT_SEC = 20

const HELP_TEXT = `
*Available commands:*
> \`!check <node>\` - Checks the availability of a Mysterium node
> \`!help\` - Shows this help text
`
const NODE_AVAILABLE_MESSAGE = `
<@%s>: :white_check_mark: Node \`%s\` is available and has internet access. (\`%s\`).
`

const NODE_UNREACHABLE_MESSAGE = `
<@%s>: :x: Node \`%s\` is not reachable.
*Suggestions:*
> • Check that the node key is correct.
> • Check that the public IP address is correct.
> • Check that \`mysterium-node\` is running.
> • Check that inbound traffic on port \`1194\` is forwarded to the node.
`

const NODE_TUNNEL_FAILED_MESSAGE = `
<@%s>: :x: Node \`%s\` failed to initialize VPN session.
*Suggestions:*
> • Check that the node key is correct.
> • Check that the public IP address is correct.
> • Check that you are running the latest version of \`mysterium-node\`.
> • Check that inbound traffic on port \`1194\` is forwarded to the node.
`

const NODE_NO_INTERNET_ACCESS_MESSAGE = `
<@%s>: :x: Node \`%s\` was unable to access the internet.
*Suggestions:*
> • Check that the node key is correct.
> • Check that the public IP address is correct.
> • Check that you are running the latest version of \`mysterium-node\`.
> • Check that the node has a working internet connection.
> • Check that IP forwarding is enabled on the node.
> • Check that \`iptables\` NAT rules allow routing to the internet.
`

const NODE_CONNECTION_TIMEOUT_MESSAGE = `
<@%s>: :x: Node \`%s\` timed out trying to access the internet after %d seconds.
*Suggestions:*
> • Check that the node key is correct.
> • Check that the public IP address is correct.
> • Check that you are running the latest version of \`mysterium-node\`.
> • Check that the node has a responsive internet connection.
> • Check that IP forwarding is enabled on the node.
> • Check that \`iptables\` NAT rules allow routing to the internet.
`

const NODE_DEFAULT_ERROR_MESSAGE = `
<@%s>: :x: Node \`%s\` failed with exit code %d.
*Suggestions:*
> • Check that the node key is correct.
> • Check that the public IP address is correct.
> • Check that you are running the latest version of \`mysterium-node\`.
> • Try the request again.
`

const UNEXPECTED_ERROR_MESSAGE = `
<@%s>: :scream: Sorry, an unexpected error occurred while processing your request.
*Suggestions:*
> • Try the request again.
`

export async function performNodeCheck(ctx, nodeKey) {
  const { client, user, channel, logger } = ctx
  logger.debug(`${user.name} requested a node check for '${nodeKey}'.`)

  // Notify user the node check will begin soon
  client.sendMessage(`<@${user.id}>: :hourglass: Checking the availability of node \`${nodeKey}\`...`, channel.id)

  let container = null

  try {
    const docker = new Docker()

    // Run the docker container
    container = await docker.run(process.env.CLIENT_IMAGE_NAME, null, null, {
      Tty: true,
      Env: [`NODE=${nodeKey}`],
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

    // Based on the exit code, notify the user
    switch (exitCode) {
      // Report success and a redacted version of the WAN IP address
      case 0: {
        const redactedIPAddress = redactIPAddress(wanIPAddress)
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
        const message = util.format(NODE_DEFAULT_ERROR_MESSAGE, user.id, nodeKey, exitCode)
        client.sendMessage(message, channel.id)
        break
      }
    }
  } catch (err) {
    // Report error to the chat
    logger.error('Unable to run docker container:', err)
    const message = util.format(UNEXPECTED_ERROR_MESSAGE, user.id)
    client.sendMessage(message, channel.id)
  } finally {
    // Cleanup the docker container
    if (container) {
      await container.remove()
    }
  }
}

export async function showHelpText(ctx) {
  const { client, user, channel, logger } = ctx
  logger.debug(`${user.name} requested help text.`)

  // Send help text to chat
  client.sendMessage(HELP_TEXT, channel.id)
}

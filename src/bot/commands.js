import Docker from 'dockerode'

import { getContainerLogs, parseWanIP, redactIPAddress } from './helpers'

const GOOGLE_DNS_SERVERS = ['8.8.8.8', '8.8.4.4']
const CAPABILITY_NET_ADMIN = 'NET_ADMIN'

const HELP_TEXT = `
*Available commands:*
> \`!check <node>\` - Checks the availability of a Mysterium node
> \`!help\` - Shows this help text
`

export async function performNodeCheck(ctx, nodeKey) {
  const { client, user, channel, logger } = ctx
  logger.debug(`${user.name} requested a node check for '${nodeKey}'.`)

  // Notify user the node check will begin soon
  client.sendMessage(`<@${user.id}>: Checking the availability of node \`${nodeKey}\`...`, channel.id)

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
      case 0:
        client.sendMessage(`<@${user.id}>: :white_check_mark: Node \`${nodeKey}\` is available and has internet access (\`${redactIPAddress(wanIPAddress)}\`).`, channel.id)
        break
      // Exit code 1 - Unable to establish mysterium client connection
      case 1:
        client.sendMessage(`<@${user.id}>: :x: Node \`${nodeKey}\` is not reachable.`, channel.id)
        break
      // Exit code 2 - Unable to create VPN tunnel session
      case 2:
        client.sendMessage(`<@${user.id}>: :x: Node \`${nodeKey}\` failed to initialize a session.`, channel.id)
        break
      // Exit code 3 - No WAN or time out (15 seconds)
      case 3:
        client.sendMessage(`<@${user.id}>: :x: Node \`${nodeKey}\` timed out attempting to access the internet.`, channel.id)
        break
      // Exit code ? - Perhaps a timeout or other error
      default:
        client.sendMessage(`<@${user.id}>: :x: Node \`${nodeKey}\` failed with status code ${exitCode}.`)
        break
    }
  } catch (err) {
    // Report error to the chat
    logger.error('Unable to run docker container:', err)
    client.sendMessage(`<@${user.id}>: :scream: Sorry, an unexpected error occurred while trying to process your request, please try again.`, channel.id)
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

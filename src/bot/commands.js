
const HELP_TEXT = `\`\`\`
Available commands:
  • !check <node> - Checks the availability of a Mysterium node
  • !help - Shows this help text
\`\`\``

export async function performNodeCheck(ctx, nodeKey) {
  const { client, user, channel, logger } = ctx
  logger.debug(`${user.name} requested a node check for '${nodeKey}'.`)

  // Notify user the node check will begin soon
  client.sendMessage(`<@${user.id}>: Checking the availability of node \`${nodeKey}\`...`, channel.id)
}

export async function showHelpText(ctx) {
  const { client, user, channel, logger } = ctx
  logger.debug(`${user.name} requested help text.`)

  // Send help text to chat
  client.sendMessage(HELP_TEXT, channel.id)
}

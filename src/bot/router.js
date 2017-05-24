
export default class CommandRouter {
  constructor(client, logger) {
    this.client = client
    this.logger = logger
    this.handlers = []
  }

  addHandler = (regex, handler) => {
    this.handlers.push([regex, handler])
  }

  handleMessage = (message) => {
    // Get the user and channel from datastore
    const user = this.client.dataStore.getUserById(message.user)
    const channel = this.client.dataStore.getChannelGroupOrDMById(message.channel)

    // Build a context object for calling the handler
    const ctx = {
      client: this.client,
      logger: this.logger,
      message,
      user,
      channel
    }

    this.logger.debug(`#${channel.name} | <${user.name}> ${message.text}`)

    // Check if any handlers are available for the message text
    for (const [regex, handler] of this.handlers) {
      const match = regex.exec(message.text)
      if (match) {
        // Call the handler with context and all capture groups as args
        handler.apply(null, [ctx, ...match.slice(1)])
        break
      }
    }
  }
}

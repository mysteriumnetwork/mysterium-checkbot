# mysterium-checkbot
Slack Bot that checks Mysterium node availability upon user requests.

**Supported commands:**
> `!check <node>` - Checks the availability of a Mysterium node  
> `!help` - Shows the help text

### Requirements
- Slack Bot API Token
- Docker
- Node v6.x+ (v7.x Recommended)

### Getting Started

The bot requires the accompanying `mysterium-client` Docker image to be build prior to running:

> `docker build --tag mysterium-client -f Dockerfile-client .`

Once that image is built, you can must configure the bot (see below section) using the `.env` file (see `.env.example` as a template).

Once you have configured the bot, you can run it:

> `npm start` (development)  
*or*  
> `npm run production`  

### Configuration

The `.env` file has several important parameters:

> `SLACK_BOT_TOKEN` - The API token for the Slack bot  
> `SLACK_BOT_CHANNEL` - Comma-seperated values of channel names to monitor for requests  
> `CLIENT_IMAGE_NAME` - Name of the docker image to launch (default should be `mysterium-client`)  

### Methodology

In order to provide as much isolation and concurrent checking of nodes, each `!check <node>` request is performed in a separate docker container. The resulting exit code and/or WAN IP address are read from the logs. The success or failure is reported to the user, and WAN IP addresses have their last two octets redacted for security.

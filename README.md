# mysterium-checkbot
Slack Bot that checks Mysterium node availability upon user requests.

**Supported commands:**
> `!check <nodes ...>` - Checks the availability of a Mysterium node (or multiple nodes)  
> `!help` - Shows the help text

### Requirements
- Slack Bot API Token
- Docker
- Node v6.x+ (v7.x Recommended)

### Getting Started

The bot requires building the two Docker images prior to running:

> `docker build --tag mysterium-client -f Dockerfile-client .`  
> `docker build --tag mysterium-checkbot -f Dockerfile-bot .`

Once the images are built, you can run the `mysterium-checkbot` image.  
**You MUST map `/var/run/docker.sock` to the `mysterium-checkbot` container!**

    docker run -d \  
      -v /var/run/docker.sock:/var/run/docker.sock \  
      -e SLACK_BOT_TOKEN=xxx \  
      --name mysterium-checkbot \  
      mysterium-checkbot  

### Environment Variables

> `SLACK_BOT_TOKEN` - (required) The API token for the Slack bot  
> `SLACK_BOT_CHANNELS` - (optional) Comma-seperated values of channel names to monitor (default is `*` for all)  
> `CLIENT_IMAGE_NAME` - (optional) Name of the docker image to launch (default should be `mysterium-client`)  
> `TIMEOUT_SECONDS` - (optional) Number of seconds before an internet check will timeout (default should be `30`)

### Methodology

In order to provide as much isolation and concurrent checking of nodes, each `!check <nodes...>` request is performed in a separate docker container. The resulting exit code and/or WAN IP address are read from the logs. The success or failure is reported to the user, and WAN IP addresses have their last two octets redacted for security.

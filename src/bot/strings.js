
export const HELP_TEXT = `
*Available commands:*
> \`!check <nodes ...>\` - Checks the availability of a Mysterium node
> \`!help\` - Shows this help text
`

export const NODE_AVAILABLE_SUMMARY = ':white_check_mark: Node `%s` is available and has internet access. (`%s`)'
export const NODE_UNREACHABLE_SUMMARY = ':x: Node `%s` is not reachable.'
export const NODE_TUNNEL_FAILED_SUMMARY = ':x: Node `%s` failed to initialize VPN session.'
export const NODE_NO_INTERNET_ACCESS_SUMMARY = ':x: Node `%s` was unable to access the internet.'
export const NODE_CONNECTION_TIMEOUT_SUMMARY = ':x: Node `%s` timed out trying to access the internet after %d seconds.'
export const NODE_DEFAULT_ERROR_SUMMARY = ':x: Node `%s` failed with exit code %d.'

export const MULTI_NODE_SUMMARY_MESSAGE = `
<@%s>: Here is a summary of the nodes you requested:
%s
`
export const NODE_AVAILABLE_MESSAGE = `
<@%s>: :white_check_mark: Node \`%s\` is available and has internet access. (\`%s\`)
`

export const NODE_UNREACHABLE_MESSAGE = `
<@%s>: :x: Node \`%s\` is not reachable.
*Suggestions:*
> • Check that the node key is correct.
> • Check that the public IP address is correct.
> • Check that \`mysterium-node\` is running.
> • Check that inbound traffic on port \`1194\` is forwarded to the node.
`

export const NODE_TUNNEL_FAILED_MESSAGE = `
<@%s>: :x: Node \`%s\` failed to initialize VPN session.
*Suggestions:*
> • Check that the node key is correct.
> • Check that the public IP address is correct.
> • Check that you are running the latest version of \`mysterium-node\`.
> • Check that inbound traffic on port \`1194\` is forwarded to the node.
`

export const NODE_NO_INTERNET_ACCESS_MESSAGE = `
<@%s>: :x: Node \`%s\` was unable to access the internet.
*Suggestions:*
> • Check that the node key is correct.
> • Check that the public IP address is correct.
> • Check that you are running the latest version of \`mysterium-node\`.
> • Check that the node has a working internet connection.
> • Check that IP forwarding is enabled on the node.
> • Check that \`iptables\` NAT rules allow routing to the internet.
`

export const NODE_CONNECTION_TIMEOUT_MESSAGE = `
<@%s>: :x: Node \`%s\` timed out trying to access the internet after %d seconds.
*Suggestions:*
> • Check that the node key is correct.
> • Check that the public IP address is correct.
> • Check that you are running the latest version of \`mysterium-node\`.
> • Check that the node has a responsive internet connection.
> • Check that IP forwarding is enabled on the node.
> • Check that \`iptables\` NAT rules allow routing to the internet.
`

export const NODE_DEFAULT_ERROR_MESSAGE = `
<@%s>: :x: Node \`%s\` failed with exit code %d.
*Suggestions:*
> • Check that the node key is correct.
> • Check that the public IP address is correct.
> • Check that you are running the latest version of \`mysterium-node\`.
> • Try the request again.
`

export const UNEXPECTED_ERROR_MESSAGE = `
<@%s>: :scream: Sorry, an unexpected error occurred while processing your request.
*Error:*
> Message: %s
*Suggestions:*
> • Try the request again.
`

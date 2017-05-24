
export const HELP_TEXT = `
*Available commands:*
> \`!check <nodes ...>\` - Checks the availability of a Mysterium node
> \`!help\` - Shows this help text
`

export const MULTI_NODE_SUCCESS_SUMMARY = '<@%s>: :white_check_mark: All nodes are available and have internet access:\n%s'
export const MULTI_NODE_WARNING_SUMMARY = '<@%s>: :warning: One or more nodes have an issue:\n%s'

export const NODE_AVAILABLE_SUMMARY = ':white_check_mark: Node `%s` is available and has internet access. (`%s`)'
export const NODE_UNREACHABLE_SUMMARY = ':x: Node `%s` is not reachable.'
export const NODE_TUNNEL_FAILED_SUMMARY = ':x: Node `%s` failed to initialize VPN session.'
export const NODE_NO_INTERNET_ACCESS_SUMMARY = ':x: Node `%s` was unable to access the internet.'
export const NODE_CONNECTION_TIMEOUT_SUMMARY = ':x: Node `%s` timed out trying to access the internet after %d seconds.'
export const NODE_DEFAULT_ERROR_SUMMARY = ':x: Node `%s` failed with exit code %d.'

export const NODE_AVAILABLE_MESSAGE = '<@%s>: :white_check_mark: Node `%s` is available and has internet access. (`%s`)'
export const NODE_UNREACHABLE_MESSAGE = '<@%s>: :x: Node `%s` is not reachable.'
export const NODE_TUNNEL_FAILED_MESSAGE = '<@%s>: :x: Node `%s` failed to initialize VPN session.'

export const NODE_NO_INTERNET_ACCESS_MESSAGE = '<@%s>: :x: Node `%s` was unable to access the internet.'
export const NODE_CONNECTION_TIMEOUT_MESSAGE = '<@%s>: :x: Node `%s` timed out trying to access the internet after %d seconds.'
export const NODE_DEFAULT_ERROR_MESSAGE = '<@%s>: :x: Node `%s` failed with exit code %d.'

export const UNEXPECTED_ERROR_MESSAGE = `
<@%s>: :scream: Sorry, an unexpected error occurred while processing your request.
*Error:*
> Message: %s
*Suggestions:*
> • Try the request again.
`

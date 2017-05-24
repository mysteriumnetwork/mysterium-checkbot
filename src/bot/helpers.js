
const WAN_IP_REGEX = /^WAN IP:\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/i

export function readStreamToEnd(stream) {
  return new Promise((resolve, reject) => {
    let buffer = ''
    stream.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
    })
    stream.once('end', () => resolve(buffer))
    stream.once('error', reject)
  })
}

export async function getContainerLogs(container) {
  const stream = await container.logs({ stdout: 1, tail: 10 })
  const log = await readStreamToEnd(stream)
  return log.split(/(\r|\n)/)
    .filter(line => line && line.trim())
    .join('\n')
}

export async function parseWanIP(logs) {
  const lines = logs.split(/(\r|\n)/).filter(line => line && line.trim())

  for (const line of lines) {
    const match = WAN_IP_REGEX.exec(line)
    if (match) {
      return match[1]
    }
  }

  return null
}

export function redactIPAddress(ipAddress) {
  const octets = ipAddress.split('.')
  return [...octets.slice(0, 2), '*', '*'].join('.')
}

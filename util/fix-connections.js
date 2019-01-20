// *** BACKSTORY ***
// there has been an evolution of how connection host:port and ws are set
// historically you have been able to set host, port net connections,
// and we want to keep this behaviour to support legacy code, and easy CLI setting
//
// we also want to support the new connections.incoming style
// this code:
//   - checks that a user is not declaring conflicting settings
//      (so new/ old parts of the stack don't run divergent config!)
//   - writes host,port,ws settings based on the connections.incoming setting

module.exports = function fixConnections (config) {
  const net = getTransport(config, 'net', 8008)
  const ws = getTransport(config, 'ws', 8989)

  var errors = []
  if (config.host && net.host) {
    if (config.host !== net.host) errors.push('net host')
  }
  if (config.port && net.port) {
    if (config.port !== net.port) errors.push('net port')
  }
  if (config.ws && config.ws.port && ws.port) {
    if (config.ws.port !== ws.port) errors.push('ws port')
  }
  if (errors.length) throw new Error('ssb-config: conflicting connection settings for: ' + errors.join(', '))

  // *** LEGACY (ensure host:port + ws are set) ***
  config.host = net.host
  config.port = net.port
  config.ws = ws

  return config
}

var get = require('lodash.get')

function getTransport (config, protocolName, defaultPort) {
  var connection = get(config, 'connections.incoming.'+protocolName, [])
    .find(function (transport) {
      return isAccessible(transport)
    })

  if (!connection) return { host: undefined, port: defaultPort }

  return {
    host: connection.host,
    port: connection.port || defaultPort
  }
}

function isAccessible (transport) {
  return transport.scope === 'private' || transport.scope.includes('private') ||
    transport.scope === 'public' || transport.scope.includes('public')
}




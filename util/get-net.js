var get = require('lodash.get')

module.exports = function getNet (config) {
  var connection = get(config, 'connections.incoming.net', [])
    .find(function (transport) {
      return isAccessible(transport)
    })

  if (!connection) return { host: undefined, port: 8008 }

  return {
    host: connection.host,
    port: connection.port || 8008
  }
}

function isAccessible (transport) {
  return transport.scope === 'private' || transport.scope.includes('private') ||
    transport.scope === 'public' || transport.scope.includes('public')
}

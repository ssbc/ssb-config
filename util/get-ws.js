var get = require('lodash.get')

module.exports = function getNet (config) {
  var connection = get(config, 'connections.incoming.ws', [])
    .find(function (transport) {
      return isAccessible(transport)
    })

  if (!connection) return {host: undefined, port: 8989}

  return {
    host: connection.host,
    port: connection.port || 8989
  }
}

function isAccessible (transport) {
  return transport.scope === 'private' || transport.scope.includes('private') ||
    transport.scope === 'public' || transport.scope.includes('public')
}

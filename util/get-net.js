var get = require('lodash.get')

module.exports = function getNet (config) {
  var connection = get(config, 'connections.incoming.net', [])
    .find(function (transport) {
      return isAccessible(transport)
    })

  if (!connection) return {}

  return {
    host: connection.host,
    port: connection.port
  }
}

function isAccessible (transport) {
  return transport.scope === 'private' || transport.scope.includes('private') ||
    transport.scope === 'public' || transport.scope.includes('public')
}

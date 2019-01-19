var get = require('lodash.get')

module.exports = function getNet (config) {
  var connection = get(config, 'connections.incoming.ws', [])
    .find(function (transport) {
      return isAccessible(transport)
    })

  if (!connection) return
  if (!connection.host || !connection.port) throw new Error('ssb-config require ws settings with host AND port')

  return connection
}

function isAccessible (transport) {
  return transport.scope === 'private' || transport.scope.includes('private') ||
    transport.scope === 'public' || transport.scope.includes('public')
}

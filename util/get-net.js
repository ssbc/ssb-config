var get = require('lodash.get')

module.exports = function getNet (config) {
  var connection = get(config, 'connections.incoming.net', [])
    .find(function (transport) {
      return isPublic(transport)
    })

  if (!connection) return {}

  return {
    host: connection.host,
    port: connection.port
  }
}

function isPublic (transport) {
  return transport.scope === 'public' || transport.scope.includes('public')
}

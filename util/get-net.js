var get = require('lodash.get')

module.exports = function getNet (config) {
  var connection = get(config, 'connections.incoming.net', [])
    .find(function (transport) {
      return isAccessible(transport)
    })

  if (!connection) return

  return connection
}

function isAccessible (transport) {
  const scopes = [
    'public', // internet
    'local', // local wifi
    'private' // (alias of local)
  ]

  return scopes.some(s => {
    return transport.scope === s || transport.scope.includes(s)
  })
}

var get = require('lodash.get')

module.exports = function getNet (config) {
  const conns = get(config, 'connections.incoming.ws', [])

  return (
    conns.find(isPublic) ||
    conns.find(isLocal) ||
    conns.find(isDevice)
  )
}

function isPublic (transport) {
  const scope = 'public' // internet

  return (
    transport.scope === scope ||
    transport.scope.includes(scope)
  )
}

function isLocal (transport) {
  const scopes = [
    'local', // local wifi
    'private' // (alias of local)
  ]

  return scopes.some(s => {
    return transport.scope === s || transport.scope.includes(s)
  })
}

function isDevice (transport) {
  const scope = 'device' // local device only

  return (
    transport.scope === scope ||
    transport.scope.includes(scope)
  )
}

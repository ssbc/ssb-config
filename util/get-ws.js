var get = require('lodash.get')

module.exports = function getNet (config) {
  var connection = get(config, 'connections.incoming.ws', [])[0]

  if (!connection) return {}

  return {
    // host: connection.host,
    port: connection.port
  }
}

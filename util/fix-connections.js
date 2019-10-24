var getNet = require('./get-net')
var getWS = require('./get-ws')
var defaultPorts = require('../default-ports')

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
  const net = getNet(config) || {}
  const ws = getWS(config) || {}

  // Add default ports
  if (net.host && !net.port) net.port = config.port || defaultPorts.net
  if (ws.host && !ws.port) ws.port = config.port || defaultPorts.ws

  // [LEGACY] ensure host:port + ws are set
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

  if (errors.length) {
    const message = 'ssb-config: conflicting connection settings for: ' + errors.join(', ')
    throw new Error(message)
  }

  // LEGACY - ensure host and port are set
  // (but based on new connections config style)
  config.host = net.host || ws.host
  config.port = net.port
  config.ws = ws

  return config
}

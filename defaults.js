var path = require('path')
var home = require('os-homedir')
var merge = require('deep-extend')
var ssbCaps = require('ssb-caps')
var ssbKeys = require('ssb-keys')
const get = require('lodash.get')

var fixConnections = require('./util/fix-connections')
const defaultPorts = require('./default-ports')

var SEC = 1e3
var MIN = 60 * SEC

module.exports = function setDefaults (name, config) {
  var baseDefaults = {
    path: path.join(home() || 'browser', '.' + name),
    party: true,
    timeout: 0,
    pub: true,
    local: true,
    friends: {
      dunbar: 150,
      hops: 2
    },
    gossip: {
      connections: 3
    },
    connections: {
      outgoing: {
        net: [{ transform: 'shs' }],
        onion: [{ transform: 'shs' }]
      }
    },
    timers: {
      connection: 0,
      reconnect: 5 * SEC,
      ping: 5 * MIN,
      handshake: 5 * SEC
    },
    // change these to make a test network that will not connect to the main network.
    caps: ssbCaps,
    master: [],
    logging: { level: 'notice' }
  }
  config = merge(baseDefaults, config || {})

  if (!config.connections.incoming) {
    // if no incoming connections have been set,
    // populate this with some rad-comprehensive defaults!
    config.connections.incoming = {
      net: [{
	host: config.host || '::',
	port: config.port || defaultPorts.net,
	scope: ['device', 'local', 'public'],
	transform: 'shs'
      }],
      ws: [{
	host: config.host || '::',
	port: get(config, 'ws.port', defaultPorts.ws),
	scope: ['device', 'local', 'public'],
	transform: 'shs'
      }]
    }
  }

  config = fixConnections(config)

  if (config.keys == null) {
    config.keys = ssbKeys.loadOrCreateSync(path.join(config.path, 'secret'))
  }

  return config
}

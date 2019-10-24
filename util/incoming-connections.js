const get = require('lodash.get')
const os = require('os')
const defaultPorts = require('../default-ports')

// generates all possible incoming connection settings that you could bind to
module.exports = function (config) {
  var incoming

  // We have to deal with some legacy behavior where:
  //
  // - net port is defined by `config.port`
  // - ws port is defined by `config.ws.port`
  // - other services have no canonical port config location (TODO?)
  const getPort = (service) => {
    const defaultPort = defaultPorts[service]

    if (service === 'net') {
      return get(config, 'port', defaultPort)
    }
    if (service === 'ws') {
      return get(config, 'ws.port', defaultPort)
    }

    return defaultPort
  }

  // We only use two scopes by default:
  //
  // - internal: inaccessible over the network
  // - external: accessible over the network
  //
  const scope = {
    internal: ['device'],
    external: ['device', 'local', 'public']
  }

  // If `config.host` is defined then we don't need to enumerate interfaces.
  if (config.host) {
    incoming = {
      net: [{
        host: config.host,
        port: getPort('net'),
        scope: scope.external,
        transform: 'shs'
      }],
      ws: [{
        host: config.host,
        port: getPort('ws'),
        scope: scope.external,
        transform: 'shs'
      }]
    }
  } else {
    // Trying to hardcode reasonable defaults here doesn't seem possible.
    //
    // Instead, the below code enumerates all network interfaces and adds them
    // to `config.connections.incoming` for each service in `defaultPorts`.

    // If you aren't familiar, you should at least skim these docs:
    // https://nodejs.org/api/os.html#os_os_networkinterfaces
    const interfaces = os.networkInterfaces()

    // Game plan: we're going to enumerate the services (e.g. net and ws) and
    // return an object that looks like this:
    //
    // {
    //   net: [ interface, interface, ... ]
    //   ws: [ interface, interface, ... ]
    // }
    incoming = Object.keys(defaultPorts).map((service) => {
      return {
        service,
        interfaces: Object.values(interfaces).reduce((acc, val) => {
          // Future TODO: replace with shiny new `Array.prototype.flat()`.
          return acc.concat(val)
        }, []).filter(item => {
          // We want to avoid scoped IPv6 addresses since they don't seem to
          // play nicely with the Node.js networking stack. These addresses
          // often start with `fe80` and throw EINVAL when we try to bind to
          // them.
          return item.scopeid == null || item.scopeid === 0
        }).map(item => {
          // This bit is simple because the ssb-config options for `incoming`
          // can either be hardcoded or directly inferred from `interfaces`.
          return {
            host: item.address,
            port: getPort(service),
            scope: item.internal ? scope.internal : scope.external,
            transform: 'shs'
          }
        })
      }
    }).reduce((result, obj) => {
      // This `reduce()` step is necessary because we need to return an object
      // rather than an array. There may be a simpler way to do this.
      result[obj.service] = obj.interfaces
      return result
    }, {})
  }

  return incoming
}

var test = require('tape')

var Config = require('../inject')

test('setting custom host:port', t => {
  var config = Config('testnet', {
    host: 'pub.mixmix.io',
    port: 2001
  })

  var { host, port } = config.connections.incoming.net[0]
  t.equal(host, 'pub.mixmix.io', 'net: sets custom host in connections')
  t.equal(port, 2001, 'net: sets custom port in connections')

  t.equal(config.host, 'pub.mixmix.io', 'net: [LEGACY] custom config.host is set')
  t.equal(config.port, 2001, 'net: [LEGACY] custom config.port is set')

  var { host: WSHost, port: WSPort } = config.connections.incoming.ws[0]
  t.equal(WSHost, 'pub.mixmix.io', 'ws: sets custom host in connections')
  t.equal(WSPort, 8989, 'ws: sets default port in connections')

  t.equal(config.ws.port, 8989, 'ws: [LEGACY] custom config.ws.port is set')

  t.end()
})

test('setting custom connections.incoming', t => {
  var config = Config('testnet', {
    connections: {
      incoming: {
        net: [{ host: 'pub.mixmix.io', port: 23456, scope: 'public' }],
        ws: [{ host: 'pub.mixmix.io', port: 23457, scope: 'public' }]
      }
    }
  })

  var { host, port } = config.connections.incoming.net[0]
  t.equal(host, 'pub.mixmix.io', 'net: sets custom host in connections')
  t.equal(port, 23456, 'net: sets custom port in connections')

  t.equal(config.host, 'pub.mixmix.io', 'net: [LEGACY] custom config.host is set')
  t.equal(config.port, 23456, 'net: [LEGACY] custom config.port is set')

  var { host: WSHost, port: WSPort } = config.connections.incoming.ws[0]
  t.equal(WSHost, 'pub.mixmix.io', 'ws: sets custom host in connections')
  t.equal(WSPort, 23457, 'ws: sets default port in connections')

  t.equal(config.ws.port, 23457, 'ws: [LEGACY] custom config.ws.port is set')

  t.end()
})

test('CONFLICTING custom host:port connections.incoming settings', t => {
  var netHost = () => {
    Config('testnet', {
      host: 'peach.party',
      connections: {
        incoming: {
          net: [{ host: 'pub.mixmix.io', port: 23456, scope: 'public' }]
        }
      }
    })
  }

  var netPort = () => {
    Config('testnet', {
      host: 'pub.mixmix.io',
      port: 2019,
      connections: {
        incoming: {
          net: [{ host: 'pub.mixmix.io', port: 23456, scope: 'public' }],
          ws: [{ host: 'pub.mixmix.io', port: 23457, scope: 'public' }]
        }
      }
    })
  }
  var wsPort = () => {
    Config('testnet', {
      ws: { port: 2019 },
      connections: {
        incoming: {
          net: [{ host: 'pub.mixmix.io', port: 23456, scope: 'public' }],
          ws: [{ host: 'pub.mixmix.io', port: 23457, scope: 'public' }]
        }
      }
    })
  }

  function testThrow (fn, target) {
    try {
      fn()
    } catch (e) {
      var expectedMessage = `ssb-config: conflicting connection settings for: ${target}`
      t.equal(e.message, expectedMessage, `catches conflicting ${target} settings`)
    }
  }
  testThrow(netHost, 'net host')
  testThrow(netPort, 'net port')
  testThrow(wsPort, 'ws port')

  // mix: I know t.throws exists, but testing the error message output was annoying

  t.end()
})

test('setting connections.incoming explicitly with no ws', t => {
  // because we don't want websockets active

  var config = Config('testnet', {
    connections: {
      incoming: {
        net: [{ host: 'pub.mixmix.io', port: 23456, scope: 'public' }]
        // ws: [{ host: 'pub.mixmix.io', port: 23457, scope: 'public' }]
      }
    }
  })

  t.equal(config.connections.incoming.ws, undefined, 'no ws set in connection.incoming')
  t.equal(config.ws.port, undefined, 'ws: [LEGACY] no config.ws.port set')
  t.equal(config.host, 'pub.mixmix.io', 'host still derived from net setting')

  t.end()
})

test('incoming net connection has no port configured', t => {
  var config = Config('testnet', {
    connections: {
      incoming: {
        net: [{ host: 'pub.mixmix.io', scope: 'public' }]
      }
    }
  })

  var { port } = config.connections.incoming.net[0]
  t.equal(port, 8008, 'net: sets default port in connections')
  t.equal(config.port, 8008, 'net: [LEGACY] default config.port is set')

  t.end()
})

test('incoming ws connection has no port configured', t => {
  var config = Config('testnet', {
    connections: {
      incoming: {
        ws: [{ host: 'pub.mixmix.io', scope: 'public' }]
      }
    }
  })

  var { port } = config.connections.incoming.ws[0]
  t.equal(port, 8989, 'ws: sets default port in connections')
  t.equal(config.ws.port, 8989, 'ws: [LEGACY] default config.ws.port is set')

  t.end()
})

test('port is set on top level, but not incoming', t => {
  var config = Config('testnet', {
    port: 8009,
    host: 'localhost',
    connections: {
      incoming: {
        net: [{ scope: ['device', 'local'], host: 'localhost' }]
      }
    }
  })
  console.log(config.connections.incoming)

  t.equal(config.port, 8009, 'net: sets default port in connections')

  t.end()
})

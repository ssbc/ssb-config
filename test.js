var test = require('tape')
var Server = require('ssb-server')
var home = require('os-homedir')()

var defaultConfig = require('./')
var Config = require('./inject')

test('Default config', t => {
  t.equal(defaultConfig.path, `${home}/.ssb`, 'has default ~/.ssb folder')
  t.equal(defaultConfig.connections.incoming.net[0].port, 8008, 'e.g. has default port')
  t.equal(defaultConfig.friends.dunbar, 150, 'e.g. has default dunbar number')

  var server = Server(defaultConfig)

  server.whoami((err, feed) => {
    t.false(err, 'server starts')
    t.true(feed.id.startsWith('@'), 'starts server safely')
    server.close(() => t.end())
  })
  // mix: I know whoami can be run as a sync call on the server.
  // I've found it confusing to move between remote and local and to forget remote methods must be async
})

test('Custom config', t => {
  var config = Config('testnet', { port: 9999, friends: { dunbar: 1500 } })

  t.equal(config.path, `${home}/.testnet`, 'adjusts path to match appname')
  t.equal(config.connections.incoming.net[0].port, 9999, 'e.g. has default port')
  t.equal(config.friends.dunbar, 1500, 'has new default dunbar number')

  var server = Server(config)

  server.whoami((err, feed) => {
    t.false(err, 'server starts')
    t.true(feed.id.startsWith('@'), 'starts server safely')
    server.close(() => t.end())
  })
})

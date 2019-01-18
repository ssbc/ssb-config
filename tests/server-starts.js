var test = require('tape')
//var Server = require('ssb-server')
var home = require('os-homedir')()

var defaultConfig = require('../')
var Config = require('../inject')

//not including default tests, because they fail if you are running ssb-server in background
test('Default config', t => {
  t.equal(defaultConfig.path, `${home}/.ssb`, 'has default ~/.ssb folder')
  t.equal(defaultConfig.connections.incoming.net[0].port, 8008, 'e.g. has default port')
  t.equal(defaultConfig.friends.dunbar, 150, 'e.g. has default dunbar number')

  t.end()
})

test('Custom config', t => {
  var config = Config('testnet', { port: 9999, friends: { dunbar: 1500 } })

  t.equal(config.path, `${home}/.testnet`, 'adjusts path to match appname')
  t.equal(config.connections.incoming.net[0].port, 9999, 'e.g. has default port')
  t.equal(config.friends.dunbar, 1500, 'has new default dunbar number')

  t.end()
})





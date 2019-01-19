var test = require('tape')
var Client = require('ssb-client')
var home = require('os-homedir')()
var Server = require('ssb-server')
  .use(require('ssb-server/plugins/master'))

var Defaults = require('../defaults')
var Config = require('../inject')

if (process.env.SKIP_SERVER) {
  console.log('\n!! skipping server startup tests\n')
  return 
}

test('Server startup - default config', t => {
  // NOTE: ideally would use index.js, but maybe on a system with ~/.ssb/config,
  // this simulates a clean setup by side-stepping RC
  const defaultConfig = Defaults('ssb')

  t.equal(defaultConfig.path, `${home}/.ssb`, 'has default ~/.ssb folder')
  // two arbitrary things to test:
  t.equal(defaultConfig.connections.incoming.net[0].port, 8008, 'e.g. has default port')
  t.equal(defaultConfig.friends.dunbar, 150, 'e.g. has default dunbar number')

  var server = Server(defaultConfig)

  // IS THIS NEEDED?
  // defaultConfig.appKey = defaultConfig.caps.shs

  server.whoami((err, feed) => {
    t.false(err, 'server starts')
    t.true(feed.id.startsWith('@'), 'server responds')

    writeManifest(server)

    Client(defaultConfig.keys, defaultConfig, (err, ssb) => {
      if (err) console.log(err)
      t.false(err, 'remote connection to server works')

      ssb.whoami((err, feed) => {
        t.true(feed.id.startsWith('@'), 'remote query works')

        ssb.close(() => {
          server.close(() => t.end())
        })
      })
    })
  })
  // mix: I know whoami can be run as a sync call on the server.
  // I've found it confusing to move between remote and local and to forget remote methods must be async
})

test('Server startup - custom config', t => {
  var config = Config('testnet', { port: 9999, friends: { dunbar: 1500 } })

  t.equal(config.path, `${home}/.testnet`, 'adjusts path to match appname')
  t.equal(config.connections.incoming.net[0].port, 9999, 'e.g. has default port')
  t.equal(config.friends.dunbar, 1500, 'has new default dunbar number')

  var server = Server(config)

  server.whoami((err, feed) => {
    t.false(err, 'server starts')
    t.true(feed.id.startsWith('@'), 'starts server safely')

    writeManifest(server)

    Client(config.keys, config, (err, ssb) => {
      if (err) console.log(err)
      t.false(err, 'remote connection to server works')

      ssb.whoami((err, feed) => {
        t.true(feed.id.startsWith('@'), 'remote query works')

        ssb.close(() => {
          server.close(() => t.end())
        })
      })
    })
  })
})

// helpers

function writeManifest (server) {
  var fs = require('fs')
  var Path = require('path')

  fs.writeFileSync(
    Path.join(server.config.path, 'manifest.json'),
    JSON.stringify(server.getManifest())
  )
}

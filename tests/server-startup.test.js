var test = require('tape')
var Path = require('path')
var Client = require('ssb-client')
var home = require('os-homedir')()

var { fork } = require('child_process');

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

  // check a few basic config thangs
  t.equal(defaultConfig.path, `${home}/.ssb`, 'has default ~/.ssb folder')
  t.equal(defaultConfig.connections.incoming.net[0].port, 8008, 'e.g. has default port')
  t.equal(defaultConfig.friends.dunbar, 150, 'e.g. has default dunbar number')


  const server = fork(Path.join(__dirname, './server-default.js'))
  // const server = fork(Path.join(__dirname, '../server.js'), { detached: true })

  server.on('message', msg => {
    if (msg.action === 'KILLME') server.kill()

    if (msg.action === 'READY') {
      Client(defaultConfig.keys, defaultConfig, (err, ssb) => {
        if (err) { 
          console.log(err)
          
          server.send({ action: 'CLOSE' })
          server.kill()
        }

        t.false(err, 'remote connection to server works')

        ssb.whoami((err, feed) => {
          t.true(feed.id.startsWith('@'), 'remote query works')

          ssb.close(() => {
            server.send({ action: 'CLOSE' })
            t.end()
          })
        })
      })
    }
  })
})

// test('Server startup - custom config', t => {
//   var config = Config('testnet', { port: 9999, friends: { dunbar: 1500 } })

//   t.equal(config.path, `${home}/.testnet`, 'adjusts path to match appname')
//   t.equal(config.connections.incoming.net[0].port, 9999, 'e.g. has default port')
//   t.equal(config.friends.dunbar, 1500, 'has new default dunbar number')

//   var server = Server(config)

//   server.whoami((err, feed) => {
//     t.false(err, 'server starts')
//     t.true(feed.id.startsWith('@'), 'starts server safely')

//     writeManifest(server)

//     Client(config.keys, config, (err, ssb) => {
//       if (err) console.log(err)
//       t.false(err, 'remote connection to server works')

//       ssb.whoami((err, feed) => {
//         t.true(feed.id.startsWith('@'), 'remote query works')

//         ssb.close(() => {
//           server.close(() => t.end())
//         })
//       })
//     })
//   })
// })

// helpers

function writeManifest (server) {
  var fs = require('fs')
  var Path = require('path')

  fs.writeFileSync(
    Path.join(server.config.path, 'manifest.json'),
    JSON.stringify(server.getManifest())
  )
}

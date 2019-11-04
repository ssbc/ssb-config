var test = require('tape')
var Path = require('path')
var Client = require('ssb-client')
var home = require('os-homedir')()

var { fork } = require('child_process')

var configDefault = require('./server/default.config.js')
var configCustom = require('./server/custom.config.js')

if (process.env.SKIP_SERVER) {
  console.log('\n!! skipping server startup tests\n')
  // HACK: this skips the tests as an alternative to a global `return`
  test = function () {}
}

test('Server startup - default config', t => {
  // NOTE: ideally would use index.js, but maybe on a system with ~/.ssb/config,
  // this simulates a clean setup by side-stepping RC

  // check a few basic config thangs
  t.equal(configDefault.path, `${home}/.ssb`, 'has default ~/.ssb folder')
  t.equal(configDefault.connections.incoming.net[0].port, 8008, 'e.g. has default port')
  t.equal(configDefault.friends.dunbar, 150, 'e.g. has default dunbar number')

  const child = fork(Path.join(__dirname, './server/default.js'))
  // const child = fork(Path.join(__dirname, '../server.js'), { detached: true })

  child.on('message', msg => {
    if (msg.action === 'KILLME') child.kill()
    if (msg.action === 'READY') {
      Client(configDefault.keys, configDefault, (err, ssb) => {
        if (err) {
          console.log(err)

          child.send({ action: 'CLOSE' })
          child.kill()
        }

        t.false(err, 'remote connection to server works')

        ssb.whoami((_, feed) => {
          if (err) throw err
          t.true(feed.id.startsWith('@'), 'remote query works')

          ssb.close(() => {
            child.send({ action: 'CLOSE' })
            t.end()
          })
        })
      })
    }
  })

  child.send({ action: 'READY' })
})

test('Server startup - custom config', t => {
  t.equal(configCustom.path, `${home}/.testnet`, 'adjusts path to match appname')
  t.equal(configCustom.connections.incoming.net[0].port, 9999, 'e.g. has default port')
  t.equal(configCustom.friends.dunbar, 1500, 'has new default dunbar number')

  const server = fork(Path.join(__dirname, './server/custom.js'))

  server.on('message', msg => {
    if (msg.action === 'KILLME') server.kill()

    if (msg.action === 'READY') {
      Client(configCustom.keys, configCustom, (err, ssb) => {
        if (err) {
          console.log(err)

          server.send({ action: 'CLOSE' })
          server.kill()
        }

        t.false(err, 'remote connection to server works')

        ssb.whoami((err, feed) => {
          if (err) throw err
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

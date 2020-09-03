var test = require('tape')
const { join } = require('path')
const Client = require('ssb-client')
const home = require('os-homedir')()

var { fork } = require('child_process')

var configCustom = require('./server/custom.config.js')

if (process.env.SKIP_SERVER) {
  console.log('\n!! skipping server startup tests\n')
  // HACK: this skips the tests as an alternative to a global `return`
  test = function () {}
}

function checkStartUp ({ t, processPath, config }) {
  const server = fork(join(__dirname, 'server', processPath))
  // const server = fork(Path.join(__dirname, '../server.js'), { detached: true })

  server.on('message', msg => {
    if (msg.action === 'KILLME') server.kill()
    if (msg.action === 'READY') {
      Client(config.keys, config, (err, ssb) => {
        if (err) {
          console.log(err)

          server.send({ action: 'CLOSE' })
          server.kill()
        }

        t.false(err, 'remote connection to server works')

        ssb.whoami((_, feed) => {
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

  server.send({ action: 'READY' })
}

test('server startup', t => {
  t.test('ssb-server, default config', t => {
    const config = require('./server/default.config.js')
    const processPath = 'ssb-server/default.js'

    t.equal(config.path, join(home, '.ssb'), 'has default ~/.ssb folder')
    t.equal(config.connections.incoming.net[0].port, 8008, 'e.g. has default port')
    t.equal(config.friends.dunbar, 150, 'e.g. has default dunbar number')

    checkStartUp({ t, config, processPath })
  })

  t.test('ssb-server, custom config', t => {
    const config = require('./server/custom.config.js')
    const processPath = 'ssb-server/custom.js'

    t.equal(configCustom.path, join(home, '.testnet'), 'adjusts path to match appname')
    t.equal(configCustom.connections.incoming.net[0].port, 9999, 'e.g. has default port')
    t.equal(configCustom.friends.dunbar, 1500, 'has new default dunbar number')

    checkStartUp({ t, config, processPath })
  })

  t.test('secret-stack, default config', t => {
    const config = require('./server/default.config.js')
    const processPath = 'secret-stack/default.js'
    checkStartUp({ t, config, processPath })
  })

  t.test('secret-stack, custom config', t => {
    const config = require('./server/custom.config.js')
    const processPath = 'secret-stack/custom.js'
    checkStartUp({ t, config, processPath })
  })

  t.end()
})

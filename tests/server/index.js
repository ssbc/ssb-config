const fs = require('fs')
const Path = require('path')

const Server = require('ssb-server')
  .use(require('ssb-master'))

module.exports = function TestServer (config) {
  const server = Server(config)
  writeManifest(server)

  process.on('message', msg => {
    if (msg.action === 'CLOSE') {
      server.close(() => {
        console.log('CLOSING')
        process.send({ action: 'KILLME' })
      })
    }
  })

  server.whoami((err, data) => {
    if (err) {
      server.close()
      throw err
    }

    console.log('> server started')
    setTimeout(() => process.send({ action: 'READY' }), 5)
  })
}

function writeManifest (server) {
  fs.writeFileSync(
    Path.join(server.config.path, 'manifest.json'),
    JSON.stringify(server.getManifest())
  )
}

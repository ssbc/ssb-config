const fs = require('fs')
const Path = require('path')

module.exports = function TestServer (config) {
  const Server = require('ssb-server')
    .use(require('ssb-server/plugins/master'))

  const server = Server(config)
  writeManifest(server)

  process.on('message', msg => {
    if (msg.action === 'CLOSE') {
      server.close(() => {
        process.send({ action: 'KILLME' })
      })
    }
  })

  server.whoami((err, data) => {
    if (err) return server.close()

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

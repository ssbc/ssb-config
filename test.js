var Server = require('ssb-server')
var config = require('./')

const server = Server(config)

console.log(server.getManifest())

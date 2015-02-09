var path = require('path')
var home = require('osenv').home
var nonPrivate = require('non-private-ip')

module.exports = require('rc')('ssb', {
  host: nonPrivate() || '',
  port: 8008,
  timeout: 30000,
  pub: true,
  local: true,
  phoenix: true,
  friends: {
    dunbar: 150,
    hops: 3
  },
  gossip: {
    connections: 2
  },
  path: path.join(home(), '.ssb')
})

var path = require('path')
var home = require('osenv').home
var nonPrivate = require('non-private-ip')

module.exports = require('rc')('ssb', {
  //just use an ipv4 address by default.
  //there have been some reports of seemingly non-private
  //ipv6 addresses being returned and not working.
  //https://github.com/ssbc/scuttlebot/pull/102
  host: nonPrivate.v4 || '',
  port: 2000,
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

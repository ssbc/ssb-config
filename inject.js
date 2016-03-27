var path = require('path')
var home = require('osenv').home
var nonPrivate = require('non-private-ip')
var merge = require('deep-extend')

var RC = require('rc')

module.exports = function (name, override) {
  name = name || 'ssb'
  return RC(name || 'ssb', merge({
    //just use an ipv4 address by default.
    //there have been some reports of seemingly non-private
    //ipv6 addresses being returned and not working.
    //https://github.com/ssbc/scuttlebot/pull/102
    party: true,
    host: nonPrivate.v4 || '',
    port: 8008,
    timeout: 30000,
    pub: true,
    local: true,
    friends: {
      dunbar: 150,
      hops: 3
    },
    gossip: {
      connections: 2
    },
    path: path.join(home(), '.' + name),
    master: [],
    logging: { level: 'notice' }
  }, override || {}))
}

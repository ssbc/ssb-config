var RC = require('rc')
var setDefaults = require('./defaults')

module.exports = function (name, override) {
  name = name || 'ssb'
  var rc = RC(name, override || {})
  var config = setDefaults(name, rc)
  return config
}

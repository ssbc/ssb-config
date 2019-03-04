const test = require('tape')
const ssbKeys = require('ssb-keys')

var Config = require('../inject')

test('setting custom host:port', t => {
  const keys = ssbKeys.generate()
  var config = Config('testnet', { keys })

  t.equal(keys.public, config.keys.public,  'keys are correctly set')
  t.end()
})

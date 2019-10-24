const test = require('tape')
const ssbKeys = require('ssb-keys')

const Config = require('../inject')

test('default: no keys set', t => {
  const config = Config('testnet')

  t.ok(config.keys.public, 'keys exist')
  t.end()
})

test('custom: keys injected', t => {
  const keys = ssbKeys.generate()
  const config = Config('testnet', { keys })

  t.equal(keys.public, config.keys.public,  'keys exist')
  t.end()
})

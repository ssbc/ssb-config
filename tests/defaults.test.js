const test = require('tape')
const Config = require('../defaults')

test('defaults', t => {
  const defaults = {
    port: 8899,
    keys: 'placeholder'
  }
  const config = Config('testnet', defaults)

  t.equal(config.port, defaults.port, 'custom ports preserved')
  // this test was failing when there was no network connection,
  // was returning undefined

  t.end()
})

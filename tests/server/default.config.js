const Defaults = require('../../defaults')

module.exports = Defaults('ssb')
// NOTE: ideally would use index.js, but on a system with ~/.ssb/config,
// this best simulates a clean setup by side-stepping RC

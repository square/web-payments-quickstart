const test = require('ava');

const config = require('./config');

test('exports isProduction', (t) => {
  t.true(typeof config.isProduction === 'boolean');
});

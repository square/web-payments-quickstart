const test = require('ava');

const square = require('./square');

test('exports client', (t) => {
  t.true(typeof square.client.payments.create === 'function');
});

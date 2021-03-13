const test = require('ava');

const square = require('./square.js');

test('exports client', (t) => {
  t.true(typeof square.client.paymentsApi.createPayment === 'function');
});

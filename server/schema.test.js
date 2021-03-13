const test = require('ava');

const schema = require('./schema');

test('validatePaymentPayload returns true if valid payload', (t) => {
  t.true(
    schema.validatePaymentPayload({
      amount: 100,
      locationId: '🌉',
      sourceId: 't0k3n',
    })
  );
});

test('validatePaymentPayload returns false if invalid amount', (t) => {
  t.false(
    schema.validatePaymentPayload({
      amount: '$2.34',
      locationId: '🌉',
      sourceId: 't0k3n',
    })
  );
});

test('validatePaymentPayload returns false if incomplete payload', (t) => {
  t.false(
    schema.validatePaymentPayload({
      locationId: '🌉',
      sourceId: 't0k3n',
    })
  );
});

test('validatePaymentPayload returns false if empty payload', (t) => {
  t.false(schema.validatePaymentPayload({}));
});

const test = require('ava');

const schema = require('./schema');

test('validatePaymentPayload returns true if valid payload', (t) => {
  t.true(
    schema.validatePaymentPayload({
      amount: 100,
      locationId: 'LKYXSPGPXK05M',
      sourceId: 't0k3n',
    })
  );
});

test('validatePaymentPayload returns false if invalid amount', (t) => {
  t.false(
    schema.validatePaymentPayload({
      amount: '$2.34',
      locationId: 'LKYXSPGPXK05M',
      sourceId: 't0k3n',
    })
  );
});

test('validatePaymentPayload returns false if incomplete payload', (t) => {
  t.false(
    schema.validatePaymentPayload({
      locationId: 'LKYXSPGPXK05M',
    })
  );
});

test('validatePaymentPayload returns false if empty payload', (t) => {
  t.false(schema.validatePaymentPayload({}));
});

test('validateCreateCardPayload returns true if valid payload', (t) => {
  t.true(
    schema.validateCreateCardPayload({
      sourceId: 't0k3n',
      locationId: 'LKYXSPGPXK05M',
      customerId: 'customer123',
    })
  );
});

test('validateCreateCardPayload returns false if missing sourceId', (t) => {
  t.false(
    schema.validateCreateCardPayload({
      locationId: 'LKYXSPGPXK05M',
      customerId: 'customer123',
    })
  );
});

test('validateCreateCardPayload returns false if missing customerId', (t) => {
  t.false(
    schema.validateCreateCardPayload({
      sourceId: 't0k3n',
      locationId: 'LKYXSPGPXK05M',
    })
  );
});

test('validateCreateCardPayload returns false if empty payload', (t) => {
  t.false(schema.validateCreateCardPayload({}));
});

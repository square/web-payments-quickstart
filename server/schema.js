const Ajv = require('ajv/dist/jtd').default;

const ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}

// JSON Type Definition https://ajv.js.org/guide/getting-started.html#basic-data-validation
const paymentSchema = {
  properties: {
    sourceId: { type: 'string' },
    locationId: { type: 'string' },
  },
  optionalProperties: {
    amount: { type: 'uint32' },
    idempotencyKey: { type: 'string' },
    customerId: { type: 'string' },
    verificationToken: { type: 'string' },
  },
};

const cardSchema = {
  properties: {
    sourceId: { type: 'string' },
    locationId: { type: 'string' },
    customerId: { type: 'string' },
  },
  optionalProperties: {
    idempotencyKey: { type: 'string' },
    verificationToken: { type: 'string' },
  },
};

module.exports = {
  validatePaymentPayload: ajv.compile(paymentSchema),
  validateCreateCardPayload: ajv.compile(cardSchema),
};

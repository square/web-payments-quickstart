const Ajv = require('ajv/dist/jtd').default;

const ajv = new Ajv();

// JSON Type Definition https://ajv.js.org/guide/getting-started.html#basic-data-validation
const paymentSchema = {
  properties: {
    amount: { type: 'uint32' },
    locationId: { type: 'string' },
    sourceId: { type: 'string' },
  },
};

module.exports = { validatePaymentPayload: ajv.compile(paymentSchema) };

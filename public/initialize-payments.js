import { loadSquarePayments } from './load-square-payments.js';
import {
  createDeferredCardPayment,
  initializeCard,
} from './payment-methods/card.js';
import {
  initializeGooglePay,
  createDeferredGooglePayPayment,
} from './payment-methods/google-pay.js';
import { uuidV4 } from './helpers/uuid-v4.js';
import configurePaymentRequest from './helpers/configure-payment-request.js';

const intent = {
  CHARGE: 'CHARGE',
  STORE: 'STORE',
};
const locationId = 'LKYXSPGPXK05M';
// These can also be found on your Order if you've created one already
const amount = '1.00';
const currencyCode = 'USD';
const countryCode = 'US';

export default async function initializePayments() {
  const paymentDetails = {
    intent: intent.CHARGE,
    amount,
    currencyCode,
    countryCode,
    locationId,
    // See: https://developer.squareup.com/docs/working-with-apis/idempotency
    idempotencyKey: uuidV4(),
  };

  // Collection of successfully initialized Payment sources
  const paymentMethods = [];
  // Load and Initialize Square Payments
  const payments = await loadSquarePayments('sandbox', locationId);

  console.debug('Initialize payment methods');
  // ********************
  // Payment Method: Card
  // ********************
  try {
    const cardTarget = '#card-target';
    const card = await initializeCard({
      payments,
      targetElementOrSelector: cardTarget,
    });

    // Add a deferred card payment to our collection
    paymentMethods.push(
      createDeferredCardPayment(payments, card, paymentDetails)
    );
    // TODO: We need to re-bind this event in the case that our payment fails
  } catch (e) {
    console.error('Initializing Card failed', e);
  }

  // One PaymentRequest can be used for both Apple Pay and Google Pay
  // *****************************************
  // Configure PaymentRequest for digital wallets
  // *****************************************
  const paymentRequest = configurePaymentRequest(payments, paymentDetails);

  // **************************
  // Payment Method: Google Pay
  // **************************
  try {
    // Digital Wallets Buttons use the same element for both target and trigger
    const googlePayTargetAndTrigger = '#google-pay-target';
    const googlePay = await initializeGooglePay({
      payments,
      paymentRequest,
      targetElementOrSelector: googlePayTargetAndTrigger,
    });

    paymentMethods.push(
      createDeferredGooglePayPayment(googlePay, paymentDetails)
    );
  } catch (e) {
    console.error('Initializing Google Pay failed', e);
  }

  return deferredPayment(paymentMethods);
}

async function deferredPayment(paymentMethods) {
  try {
    // We can use promise.race to get the first successful payment
    const completedPayment = await Promise.race(paymentMethods);

    console.debug('Payment Succeeded', completedPayment);

    return completedPayment;
  } catch (e) {
    console.error('Payment Failed', e);
    throw e;
  }
}

console.debug('Intialize Square Payments SDK and Payment Methods');
// Because top-level await is still not supported in Safari, we use promises to initialize and handle payment results.
initializePayments()
  .then((paymentSuccess) => {
    console.debug('Create Payment completed successfully', paymentSuccess);
  })
  .catch((paymentError) => {
    console.error(
      'Create Payment failed with the following error',
      paymentError
    );
  });

import { loadSquarePayments } from './load-square-payments.js';
import {
  createDeferredCardPayment,
  initializeCard,
} from './payment-methods/card.js';
import { uuidV4 } from './services/uuid-v4.js';

const intent = {
  CHARGE: 'CHARGE',
  STORE: 'STORE',
};
const locationId = 'LKYXSPGPXK05M';
// These can also be found on your Order if you've created one already
const amount = '1.00';
const currencyCode = 'USD';

export default async function initializePayments() {
  const paymentDetails = {
    intent: intent.CHARGE,
    amount,
    currencyCode,
    locationId,
    // See: https://developer.squareup.com/docs/working-with-apis/idempotency
    idempotencyKey: uuidV4(),
  };

  // Collection of successfully initialized Payment sources
  const paymentMethods = [];
  const payments = await loadSquarePayments('sandbox', locationId);

  console.log('Initialize payment methods');
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

  // PaymentRequest can be re-used across Apple Pay and Google Pay
  // const paymentRequest = configurePaymentRequest(payments);
  // try {
  //   // Digital Wallets Buttons use the same element for both target and trigger
  //   const googlePayTargetAndTrigger = '#google-pay-target';
  //   const googlePay = await initializeGooglePay({
  //     payments,
  //     paymentRequest,
  //     targetElementOrSelector: googlePayTargetAndTrigger,
  //   });
  // } catch (e) {
  //   console.error('Initializing Google Pay failed', e);
  // }

  return deferredPayment(paymentMethods);
}

async function deferredPayment(paymentMethods) {
  try {
    // We can use promise.race to get the first successful payment
    const completedPayment = await Promise.race(paymentMethods);

    console.log('Payment Succeeded', completedPayment);

    return completedPayment;
  } catch (e) {
    console.error('Payment Failed', e);
    throw e;
  }
}

console.log('Intialize Square Payments SDK and Payment Methods');
// Because top-level await is still not supported in Safari, we use promises to initialize and handle payment results.
initializePayments()
  .then((paymentSuccess) => {
    console.log('Create Payment completed successfully', paymentSuccess);
  })
  .catch((paymentError) => {
    console.error(
      'Create Payment failed with the following error',
      paymentError
    );
  });

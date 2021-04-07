import {
  createCardPaymentOnFormSubmit,
  initializeCard,
} from './payment-methods/card.js';
import {
  initializeGooglePay,
  createGooglePayPaymentOnClick,
} from './payment-methods/google-pay.js';
import {
  initializeApplePay,
  createApplePayPaymentOnClick,
} from './payment-methods/apple-pay.js';
import {
  initializeGiftCard,
  createGiftCardPaymentOnFormSubmit,
} from './payment-methods/gift-card.js';
import {
  initializeAch,
  createAchPaymentOnFormSubmit,
} from './payment-methods/ach.js';

import { uuidV4 } from './helpers/uuid-v4.js';
import configurePaymentRequest from './helpers/configure-payment-request.js';

const intent = {
  CHARGE: 'CHARGE',
  STORE: 'STORE',
};
const sandboxAppId = 'sandbox-sq0idb-lybe_WkfKNAbb3WklswmwA';
const locationId = 'LKYXSPGPXK05M';
// These can also be found on your Order if you've created one already
const amount = '1.00';
const currencyCode = 'USD';
const countryCode = 'US';

export default async function payments() {
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
  const payments = window.Square.payments(sandboxAppId, locationId);

  console.debug('Initialize payment methods');
  // ********************
  // Payment Method: Card
  // ********************
  try {
    const cardContainer = '#card-container';
    const card = await initializeCard({
      payments,
      containerElementOrSelector: cardContainer,
    });

    // Add a deferred card payment to our collection
    paymentMethods.push(
      createCardPaymentOnFormSubmit(payments, card, paymentDetails)
    );
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
    // Digital Wallets Buttons use the same element for both container and trigger
    const googlePayContainerAndTrigger = '#google-pay-container';
    const googlePay = await initializeGooglePay({
      payments,
      paymentRequest,
      containerElementOrSelector: googlePayContainerAndTrigger,
    });

    paymentMethods.push(
      createGooglePayPaymentOnClick(googlePay, paymentDetails)
    );
  } catch (e) {
    console.error('Initializing Google Pay failed', e);
  }

  // **************************
  // Payment Method: Apple Pay
  // **************************
  try {
    // Digital Wallets Buttons use the same element for both container and trigger
    const applePayContainerAndTrigger = '#apple-pay-container';
    const applePay = await initializeApplePay({
      payments,
      paymentRequest,
      containerElementOrSelector: applePayContainerAndTrigger,
    });

    paymentMethods.push(createApplePayPaymentOnClick(applePay, paymentDetails));
  } catch (e) {
    console.error('Initializing Apple Pay failed', e);
  }

  // **************************
  // Payment Method: Gift Card
  // **************************
  try {
    // Digital Wallets Buttons use the same element for both container and trigger
    const giftCardContainer = '#gift-card-container';
    const giftCard = await initializeGiftCard({
      payments,
      containerElementOrSelector: giftCardContainer,
    });

    paymentMethods.push(
      createGiftCardPaymentOnFormSubmit(giftCard, paymentDetails)
    );
  } catch (e) {
    console.error('Initializing Gift Card failed', e);
  }

  // **************************
  // Payment Method: ACH
  // **************************
  try {
    // Digital Wallets Buttons use the same element for both container and trigger
    const giftCard = await initializeAch({
      payments,
    });

    paymentMethods.push(createAchPaymentOnFormSubmit(giftCard, paymentDetails));
  } catch (e) {
    console.error('Initializing ACH failed', e);
  }

  return completedPayment(paymentMethods);
}

async function completedPayment(paymentMethods) {
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
payments()
  .then((paymentSuccess) => {
    console.debug('Create Payment completed successfully', paymentSuccess);
  })
  .catch((paymentError) => {
    console.error(
      'Create Payment failed with the following error',
      paymentError
    );
  });

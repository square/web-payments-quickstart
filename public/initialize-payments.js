import { initializeSquarePayments } from './initialize-square-payments.js';
import { initializeCard } from './payment-methods/card.js';
import { initializeGooglePay } from './payment-methods/google-pay.js';
import createPayment from './services/create-payment.js';
import configurePaymentRequest from './payment-methods/configure-payment-request.js';
import bindPaymentMethodToTrigger from './payment-methods/bind-payment-method-to-trigger.js';

const CLICK = 'click';

export default async function initializePayments() {
  // Checkpoint 1: Can we load the script?
  // Test: payments object is initialized without error
  const payments = await initializeSquarePayments('sandbox');

  // Checkpoint 2: initialize a payment method
  console.log('Initialize payment methods');
  // Our list of successfully initialized payment methods, and the data we'll need to bind them each to their trigger
  const paymentMethodBindings = [];
  try {
    // The Card Payment Method has a different target than trigger, usually a submit button
    const cardTarget = '#card-target';
    const cardTrigger = '#card-submit-button';
    const card = await initializeCard({
      payments,
      targetElementOrSelector: cardTarget,
    });

    // Data we'll need to bind our payment method to a trigger
    paymentMethodBindings.push({
      paymentMethod: card,
      methodName: 'Card', // TMP until we add a property to payment methods
      event: CLICK,
      triggerSelector: cardTrigger,
    });
  } catch (e) {
    console.error('Initializing Card failed', e);
  }

  // PaymentRequest can be re-used across Apple Pay and Google Pay
  const paymentRequest = configurePaymentRequest(payments);
  try {
    // Digital Wallets Buttons use the same element for both target and trigger
    const googlePayTargetAndTrigger = '#gpay-target';
    const googlePay = await initializeGooglePay({
      payments,
      paymentRequest,
      targetElementOrSelector: googlePayTargetAndTrigger,
    });

    // Data we'll need to bind our payment method to a trigger
    paymentMethodBindings.push({
      paymentMethod: googlePay,
      methodName: 'Google Pay', // TMP until we add a property to payment methods
      event: CLICK,
      triggerSelector: googlePayTargetAndTrigger,
    });
  } catch (e) {
    console.error('Initializing Google Pay failed', e);
  }

  let paymentComplete = false;
  // Bind and re-bind our payment methods to their event listeners until payment succeeds
  // We use { once: true } in our .addEventListener call to avoid duplicating events
  while (!paymentComplete) {
    // This error handler is not intended to handle errors, but instead allows us to catch ignore them.
    // This allows the buyer to make another attempt to create a payment and avoids breaking the page.
    try {
      // The first of these promises to resolve successfully will provide a tokenResult we can use to create a payment
      const tokenResult = await Promise.race(
        // Only bind payment methods we've succesfully instantiated
        paymentMethodBindings.map(
          ({ paymentMethod, methodName, event, triggerSelector }) => {
            // Helper function for mapping payment methods to event listeners
            return bindPaymentMethodToTrigger(paymentMethod, {
              methodName, // Temporary until we add a property to payment methods
              event,
              triggerSelector,
            });
          }
        )
      );

      console.log(
        'Attempting to Create Payment using TokenResult',
        tokenResult
      );
      // Call our create payment helper to POST our tokenResult to the server
      const payment = await createPayment(tokenResult);

      // Check if the payment is successful
      if (payment.status === 'OK') {
        // End while-loop
        paymentComplete = true;
      }
    } catch (e) {
      // If something goes wrong while binding, tokenizing, or creating a payment
      // Log the result to your error logger.
      // Allow the buyer to try again by rebinding trigger events without changing the page.
      // This allows the buyer to retry without needing to re-enter any manually provided payment information.
      console.error(
        'Something went wrong while attempting to tokenize and create payment',
        e
      );
    }
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

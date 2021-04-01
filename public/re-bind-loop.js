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
      paymentMethods.map(
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

    console.log('Attempting to Create Payment using TokenResult', tokenResult);
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

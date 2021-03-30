export default function configurePaymentRequest(payments) {
  // Checkpoint PaymentRequest: Create Payment Request
  const paymentRequest = payments.paymentRequest({});

  // Checkpoint xxx: handle shipping contact changed
  paymentRequest.addEventListener(
    'shippingcontactchanged',
    (contact, update) => {
      // Add your business logic here.
      // This tells you the address of the buyer, and allows you to update your shipping options
      // and pricing based on their location.

      // Calling update is required.
      update();
    }
  );

  // Checkpoint: handle shipping option changed
  paymentRequest.addEventListener('shippingoptionchanged', (option, update) => {
    // Add your business logic here.
    // This tells you the shipping options selected by the buyer, and allows you to update
    // totals based on the pricing of each shipping option.
    // ^Note: I think you might get the basic cost calculation for free? TBD.

    // Calling update is required.
    update();
  });

  return paymentRequest;
}

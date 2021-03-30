// Checkpoint GPay
async function initializeGooglePay({
  payments,
  paymentRequest,
  targetElementOrSelector, // queryString or HTMLElement - target and trigger are the same in Google Pay
}) {
  // Checkpoint GPay 1.1
  // Test: you should see the Google Pay button on the screen
  console.log('Initialize Google Pay');
  const googlePay = await payments.googlePay(paymentRequest);
  try {
    console.log('Attach Google Pay');
    await googlePay.attach(targetElementOrSelector);
  } catch (e) {
    console.error('Something went wrong attaching Google Pay', e);
  }

  return googlePay;
}

export { initializeGooglePay };

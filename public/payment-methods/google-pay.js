import createPayment from '../services/create-payment.js';

async function initializeGooglePay({
  payments,
  paymentRequest,
  targetElementOrSelector,
}) {
  console.debug('Initialize Google Pay');
  // Show Google Pay customization options
  const googlePay = await payments.googlePay(paymentRequest);
  try {
    console.debug('Attach Google Pay');
    await googlePay.attach(targetElementOrSelector);
  } catch (e) {
    console.error('Something went wrong attaching Google Pay', e);
  }

  return googlePay;
}

async function createGooglePayPayment(
  googlePay,
  { locationId, idempotencyKey }
) {
  // Tokenize Google Pay
  const tokenResult = await googlePay.tokenize();
  if (tokenResult.status === 'OK') {
    const paymentResult = await createPayment({
      tokenResult,
      locationId,
      idempotencyKey,
    });

    if (paymentResult) {
      console.debug('Google Pay Payment Complete', paymentResult);

      return paymentResult;
    }
  }

  return false;
}

function createDeferredGooglePayPayment(googlePay, paymentDetails) {
  const googlePayTrigger = document.querySelector('#google-pay-target');
  const event = 'click';
  return new Promise((resolve) => {
    googlePayTrigger.addEventListener(event, async (e) => {
      e.preventDefault();
      e.stopPropagation();

      const paymentResult = await createGooglePayPayment(
        googlePay,
        paymentDetails
      );

      if (paymentResult) {
        resolve(paymentResult);
      }
    });
  });
}

export { initializeGooglePay, createDeferredGooglePayPayment };

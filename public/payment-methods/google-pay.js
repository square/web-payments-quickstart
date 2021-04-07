import createPayment from '../services/create-payment.js';

async function initializeGooglePay({
  payments,
  paymentRequest,
  containerElementOrSelector,
}) {
  console.debug('Initialize Google Pay');
  // Show Google Pay customization options
  const googlePay = await payments.googlePay(paymentRequest);

  await googlePay.attach(containerElementOrSelector);

  return googlePay;
}

async function createGooglePayPayment(googlePay, { idempotencyKey }) {
  const tokenResult = await googlePay.tokenize();
  if (tokenResult.status === 'OK') {
    const paymentResult = await createPayment({
      tokenResult,
      idempotencyKey,
    });

    if (paymentResult) {
      return paymentResult;
    }
  }

  return false;
}

function createGooglePayPaymentOnClick(googlePay, paymentDetails) {
  const googlePayTrigger = document.querySelector('#google-pay-container');
  const event = 'click';
  return new Promise((resolve) => {
    googlePayTrigger.addEventListener(event, async () => {
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

export { initializeGooglePay, createGooglePayPaymentOnClick };

import createPayment from '../services/create-payment.js';

async function initializeApplePay({ payments, paymentRequest }) {
  const applePay = await payments.applePay(paymentRequest);

  return applePay;
}

async function createApplePayPayment(applePay, { idempotencyKey }) {
  const tokenResult = await applePay.tokenize();
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

function createApplePayPaymentOnClick(applePay, paymentDetails) {
  const applePayTrigger = document.querySelector('#apple-pay-container');
  const event = 'click';
  return new Promise((resolve) => {
    applePayTrigger.addEventListener(event, async () => {
      const paymentResult = await createApplePayPayment(
        applePay,
        paymentDetails
      );

      if (paymentResult) {
        resolve(paymentResult);
      }
    });
  });
}

export { initializeApplePay, createApplePayPaymentOnClick };

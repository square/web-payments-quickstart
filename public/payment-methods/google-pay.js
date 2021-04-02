import deferredEvent from '../helpers/deferred-event.js';
import createPayment from '../services/create-payment.js';

async function initializeGooglePay({
  payments,
  paymentRequest,
  targetElementOrSelector,
}) {
  console.debug('Initialize Google Pay');
  const googlePay = await payments.googlePay(paymentRequest);
  try {
    console.debug('Attach Google Pay');
    await googlePay.attach(targetElementOrSelector);
  } catch (e) {
    console.error('Something went wrong attaching Google Pay', e);
  }

  return googlePay;
}

// eslint-disable-next-line consistent-return
async function createDeferredGooglePayPayment(
  googlePay,
  { locationId, idempotencyKey }
) {
  const googlePayTrigger = document.querySelector('#google-pay-target');
  const event = 'click';

  let paymentComplete = false;
  while (!paymentComplete) {
    try {
      console.debug('Binding Google Pay tokenization to Event Listener');
      const tokenResult = await deferredEvent(
        googlePayTrigger,
        event,
        async (resolve, reject) => {
          try {
            // Tokenize Google Pay
            const tokenResult = await googlePay.tokenize();
            if (tokenResult.status !== 'OK') {
              reject(
                new Error(
                  `Google Pay tokenization status: ${tokenResult.status}`
                )
              );
            }
            console.debug('Tokenized Google Pay successfully', tokenResult);
            // Resolve on success
            resolve(tokenResult);
            return;
          } catch (e) {
            reject(new Error('Something went wrong tokenizing Google Pay', e));
          }
        }
      );

      if (tokenResult) {
        const paymentResult = await createPayment({
          tokenResult,
          locationId,
          idempotencyKey,
        });

        if (paymentResult) {
          console.debug('Google Pay Payment Complete', paymentResult);

          paymentComplete = true;
          return paymentResult;
        }
      }
    } catch (e) {
      // Log any errors that occur to help debug issues your customers might be encountering.
      console.error(e);
    }
  }
}

export { initializeGooglePay, createDeferredGooglePayPayment };

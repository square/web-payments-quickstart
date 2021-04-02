import deferredEvent from '../helpers/deferred-event.js';
import createPayment from '../services/create-payment.js';

function initializeapplePay({ payments, paymentRequest }) {
  console.debug('Initialize Apple Pay');
  return payments.applePay(paymentRequest);
}

// eslint-disable-next-line consistent-return
async function createDeferredapplePayPayment(
  applePay,
  { locationId, idempotencyKey }
) {
  const applePayTrigger = document.querySelector('#apple-pay-container');
  const event = 'click';

  let paymentComplete = false;
  while (!paymentComplete) {
    try {
      console.debug('Binding Apple Pay tokenization to Event Listener');
      const tokenResult = await deferredEvent(
        applePayTrigger,
        event,
        async (resolve, reject) => {
          try {
            // Tokenize Apple Pay
            const tokenResult = await applePay.tokenize();
            if (tokenResult.status !== 'OK') {
              reject(
                new Error(
                  `Apple Pay tokenization status: ${tokenResult.status}`
                )
              );
            }
            console.debug('Tokenized Apple Pay successfully', tokenResult);
            // Resolve on success
            resolve(tokenResult);
            return;
          } catch (e) {
            reject(new Error('Something went wrong tokenizing Apple Pay', e));
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
          console.debug('Apple Pay Payment Complete', paymentResult);

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

export { initializeapplePay, createDeferredapplePayPayment };

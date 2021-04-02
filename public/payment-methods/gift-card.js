import createPayment from '../services/create-payment.js';
import deferredEvent from '../helpers/deferred-event.js';

// pass in payments rather than initializing for each payment method
async function initializeGiftCard({ payments, targetElementOrSelector }) {
  // GiftCard can be customized here.
  console.debug('Initialize GiftCard');
  // The GiftCard field can also be customized with card.configure(...)
  // https://developer.squareup.com/reference/sdks/web/payments/card-payments#GiftCard.configure
  const giftCard = await payments.giftCard({
    style: {
      '.input-container': {},
      '.input-container.is-error': {},
      '.input-container.is-focus': {},
      '.message-icon': {},
      '.message-icon.is-error': {},
      '.message-text': {},
      '.message-text.is-error': {},
      input: {},
      'input.is-focus': {},
      'input.is-focus::placeholder': {},
      'input::placeholder': {},
    },
  });

  try {
    console.debug('Attach GiftCard');
    await giftCard.attach(targetElementOrSelector);
  } catch (e) {
    console.error('Something went wrong attaching GiftCard', e);
  }

  return giftCard;
}

// eslint-disable-next-line consistent-return
async function createDeferredGiftCardPayment(
  payments,
  giftCard,
  { locationId, idempotencyKey }
) {
  const giftCardForm = document.querySelector('#giftCard-form');
  const event = 'submit';

  let paymentComplete = false;
  while (!paymentComplete) {
    try {
      console.debug('Binding GiftCard tokenization to Event Listener');
      const { tokenResult, billingContact } = await deferredEvent(
        giftCardForm,
        event,
        async (resolve, reject) => {
          try {
            // Tokenize GiftCard
            const tokenResult = await giftCard.tokenize();

            // Reject on tokenization failure
            if (tokenResult.status !== 'OK') {
              reject(
                new Error(`GiftCard tokenization status: ${tokenResult.status}`)
              );
            }

            // disable form submission on success
            const submitButton = giftCardForm.querySelector(
              'button[type="submit"]'
            );
            submitButton.disabled = true;

            // Resolve on success
            console.debug('Tokenized GiftCard Successfully', tokenResult);
            resolve({ tokenResult, billingContact });
            return;
          } catch (e) {
            reject(new Error('Something went wrong tokenizing GiftCard', e));
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
          console.debug('GiftCard Payment Complete', paymentResult);

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

export { initializeGiftCard, createDeferredGiftCardPayment };

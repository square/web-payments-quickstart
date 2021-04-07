import createPayment from '../services/create-payment.js';

// Initialize and Attach a card.
async function initializeGiftCard({ payments, containerElementOrSelector }) {
  // The Card field can also be customized with card.configure(...)
  // https://developer.squareup.com/reference/sdks/web/payments/card-payments#Card.configure
  const giftCard = await payments.giftCard({
    style: {
      '.input-container': {},
      '.input-container.is-error': {},
      '.input-container.is-focus': {
        borderColor: '#006aff',
      },
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

  // This is the part you'd repeat in your component every time it loads
  await giftCard.attach(containerElementOrSelector);

  return giftCard;
}

// Call this function to tokenize the card, verify the buyer, and create a payment.
async function createGiftCardPayment(giftCard, { idempotencyKey }) {
  const tokenResult = await giftCard.tokenize();

  if (tokenResult.status === 'OK') {
    const paymentResult = await createPayment({
      tokenResult,
      idempotencyKey,
    });

    if (paymentResult) {
      console.debug('Card Payment Complete', paymentResult);

      return paymentResult;
    }
  }

  return false;
}

function createGiftCardPaymentOnFormSubmit(payments, giftCard, paymentDetails) {
  const giftCardForm = document.querySelector('#gift-card-form');
  const event = 'submit';
  return new Promise((resolve) => {
    giftCardForm.addEventListener(event, async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // disable form submission
      const submitButton = giftCardForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;

      const paymentResult = await createGiftCardPayment(
        giftCard,
        payments,
        paymentDetails
      );

      if (paymentResult) {
        resolve(paymentResult);
      }

      // Re-enable the button if we don't succeed
      submitButton.disabled = false;
    });
  });
}
export { initializeGiftCard, createGiftCardPaymentOnFormSubmit };

import createPayment from '../services/create-payment.js';
import { getBillingContact } from '../helpers/form.js';

// Initialize and Attach a card.
async function initializeCard({ payments, containerElementOrSelector }) {
  // The Card field can also be customized with card.configure(...)
  // https://developer.squareup.com/reference/sdks/web/payments/card-payments#Card.configure
  const card = await payments.card({
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
  await card.attach(containerElementOrSelector);

  return card;
}

// Call this function to tokenize the card, verify the buyer, and create a payment.
async function createCardPayment(
  card,
  payments,
  { intent, locationId, idempotencyKey, amount, currencyCode, billingContact }
) {
  // Tokenize Card
  const tokenResult = await card.tokenize();

  if (tokenResult.status === 'OK') {
    const verificationDetails = await payments.verifyBuyer(tokenResult.token, {
      intent,
      billingContact,
      amount,
      currencyCode,
    });

    if (tokenResult && verificationDetails) {
      const paymentResult = await createPayment({
        tokenResult,
        verificationDetails,
        locationId,
        idempotencyKey,
      });

      if (paymentResult) {
        console.debug('Card Payment Complete', paymentResult);

        return paymentResult;
      }
    }
  }

  return false;
}

function createCardPaymentOnFormSubmit(payments, card, paymentDetails) {
  const cardForm = document.querySelector('#card-form');
  const event = 'submit';
  return new Promise((resolve) => {
    cardForm.addEventListener(event, async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // disable form submission
      const submitButton = cardForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;

      // Get other data bound to form submission
      const billingContact = getBillingContact(cardForm);

      const paymentResult = await createCardPayment(card, payments, {
        billingContact,
        ...paymentDetails,
      });

      if (paymentResult) {
        resolve(paymentResult);
      }

      // Re-enable the button if we don't succeed
      submitButton.disabled = false;
    });
  });
}
export { initializeCard, createCardPaymentOnFormSubmit };

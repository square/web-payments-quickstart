import createPayment from '../services/create-payment.js';

// Initialize and Attach a card.
async function initializeCard({ payments, targetElementOrSelector }) {
  // The Card field can also be customized with card.configure(...)
  // https://developer.squareup.com/reference/sdks/web/payments/card-payments#Card.configure
  const card = await payments.card({
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

  // This is the part you'd repeat in your component every time it loads
  await card.attach(targetElementOrSelector);

  return card;
}

// Call this function to tokenize the card, verify the buyer, and create a payment.
async function createCardPayment(
  card,
  payments,
  billingContact,
  { intent, locationId, idempotencyKey, amount, currencyCode }
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

function getBillingContact(form) {
  const formData = new FormData(form);
  // I18n/L10n Note: separate Given and Family name fields allow the buyer to share their name accurately.
  // We don't want to make incorrect assumptions on where to split their full name.
  const billingContact = {
    givenName: formData.get('givenName'),
    familyName: formData.get('familyName'),
  };

  return billingContact;
}

function createCardPaymentOnFormSubmit(payments, card, paymentDetails) {
  const cardForm = document.querySelector('#card-form');
  const event = 'submit';
  return new Promise((resolve) => {
    cardForm.addEventListener(event, async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Get other data bound to form submission
      const billingContact = getBillingContact(cardForm);

      const paymentResult = await createCardPayment(
        card,
        payments,
        billingContact,
        paymentDetails
      );

      if (paymentResult) {
        // disable form submission on success
        const submitButton = cardForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        resolve(paymentResult);
      }
    });
  });
}
export { initializeCard, createCardPaymentOnFormSubmit };

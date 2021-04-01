import createPayment from '../services/create-payment.js';

// pass in payments rather than initializing for each payment method
async function initializeCard({ payments, targetElementOrSelector }) {
  // Card can be customized here.
  console.log('Initialize Card');
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

  // The card will take the width of the container that it's attached to.
  // So the easiest way to control the width of the element is by styling it's container.
  try {
    console.log('Attach Card');
    await card.attach(targetElementOrSelector);
  } catch (e) {
    console.error('Something went wrong attaching Card', e);
  }

  return card;
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

function bindCardToTrigger(card) {
  // It's tempting to want to create a generic function to bind tokenization to input events.
  // While there may be commonality to event binding across payment methods, more often than not
  // Custom payment method logic will need to be introduced, for example payments.verifyBuyer
  // Or additional data will need to be collected for a particular payment method.
  const cardTriggerEvent = 'submit';
  const cardTriggerSelector = '#card-form';
  // TODO: can we disable the submit button until we have a valid CC input?
  return new Promise((resolve, reject) => {
    console.log('Bind card to event listener');
    // Get trigger
    const cardForm = document.querySelector(cardTriggerSelector);
    // When the buyer triggers tokenization, we will resolve the promise with the tokenResult
    cardForm.addEventListener(
      cardTriggerEvent,
      async (e) => {
        // We're using a form to gather givenName and familyName at the same time we tokenize the card
        // This allows us to provide VerifyBuyer with the buyerContact
        e.preventDefault();
        e.stopPropagation();

        const billingContact = getBillingContact(cardForm);
        if (!billingContact.givenName || !billingContact.familyName) {
          // These fields are required for payments.verifyBuyer(...)
          return;
        }

        try {
          console.log('Tokenizing Card');

          const tokenResult = await card.tokenize();
          if (tokenResult.status === 'OK') {
            console.log('Tokenized Card successfully', tokenResult);

            resolve({ tokenResult, billingContact });
            return;
          }
          // We're rejecting on any failure so we can safely re-bind our events
          console.error('Card Tokenization incomplete', tokenResult);
          reject(
            new Error('Unable to complete tokenization due to invalid data')
          );
        } catch (e) {
          reject(new Error('Something went wrong tokenizing Card', e));
        }
      },
      {
        // This event listener will only trigger once. If it fails, we cant rebind it safely.[jk
        once: true,
      }
    );
  });
}

// eslint-disable-next-line consistent-return
async function createDeferredCardPayment(
  payments,
  card,
  { intent, amount, currencyCode, locationId, idempotencyKey }
) {
  // Returns a promise that resolves when the buyer triggers the event.
  let paymentComplete = false;
  while (!paymentComplete) {
    try {
      // Re-bind our event to a promise so long as we have not successfully completed a payment
      const { tokenResult, billingContact } = await bindCardToTrigger(card);

      // Provides an additional challenge to the buyer if their payment is subject SCA
      // No-op if they are not subject to the regulation.
      const verificationDetails = await verifyBuyer(payments, {
        token: tokenResult.token,
        intent: intent.CHARGE,
        billingContact,
        amount,
        currencyCode,
      });

      if (tokenResult && verificationDetails) {
        if (intent === 'CHARGE') {
          const paymentResult = await createPayment({
            tokenResult,
            verificationDetails,
            locationId,
            idempotencyKey,
          });

          if (paymentResult) {
            console.log('Payment Complete', paymentResult);

            paymentComplete = true;
            return paymentResult;
          }
        }
      }
    } catch (e) {
      // If anything went wrong completing the payment, re-bind our event listeners without resolving.
      // We should only resolve in the case of a successful card payment
      // Log any errors that occur to help debug issues your customers might be encountering.
      console.error(e);
    }
  }
}

async function verifyBuyer(
  payments,
  {
    token,
    intent = 'CHARGE', // or 'STORE'
    billingContact, // { givenName, familyName }
    amount, // Only required for charge
    currencyCode, // Only required for charge
  }
) {
  console.log('Verifying Buyer');
  // To force a verification challenge in the Sandbox, set the token to cnon:card-nonce-requires-verification.
  try {
    if (intent === 'CHARGE') {
      // token = 'cnon:card-nonce-requires-verification';
      const verificationDetails = await payments.verifyBuyer(token, {
        intent,
        billingContact,
        amount,
        currencyCode,
      });
      console.log('Successfully Verified Buyer', verificationDetails);

      return verificationDetails;
    }

    const verificationDetails = await payments.verifyBuyer(token, {
      intent,
      billingContact,
    });
    console.log('Successfully Verified Buyer', verificationDetails);

    return verificationDetails;
  } catch (e) {
    console.error('Buyer Verification Failed', e);
    return false;
  }
}

export { initializeCard, verifyBuyer, createDeferredCardPayment };

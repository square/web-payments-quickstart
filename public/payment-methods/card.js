import createPayment from '../services/create-payment.js';
import deferredEvent from '../helpers/deferred-event.js';

// pass in payments rather than initializing for each payment method
async function initializeCard({ payments, targetElementOrSelector }) {
  // Card can be customized here.
  console.debug('Initialize Card');
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

  try {
    console.debug('Attach Card');
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

// eslint-disable-next-line consistent-return
async function createDeferredCardPayment(
  payments,
  card,
  { intent, amount, currencyCode, locationId, idempotencyKey }
) {
  const cardForm = document.querySelector('#card-form');
  const event = 'submit';

  let paymentComplete = false;
  while (!paymentComplete) {
    try {
      console.debug('Binding Card tokenization to Event Listener');
      const { tokenResult, billingContact } = await deferredEvent(
        cardForm,
        event,
        async (resolve, reject) => {
          try {
            // Tokenize Card
            const tokenResult = await card.tokenize();

            // Reject on tokenization failure
            if (tokenResult.status !== 'OK') {
              reject(
                new Error(`Card tokenization status: ${tokenResult.status}`)
              );
            }

            // disable form submission on success
            const submitButton = cardForm.querySelector(
              'button[type="submit"]'
            );
            submitButton.disabled = true;

            // Get other data bound to form submission
            const billingContact = getBillingContact(cardForm);

            // Resolve on success
            console.debug('Tokenized Card Successfully', tokenResult);
            resolve({ tokenResult, billingContact });
            return;
          } catch (e) {
            reject(new Error('Something went wrong tokenizing Card', e));
          }
        }
      );

      // Provides an additional challenge to the buyer
      // if their payment requires additional verification
      const verificationDetails = await verifyBuyer(payments, {
        token: tokenResult.token,
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

async function verifyBuyer(
  payments,
  {
    token, // To force a verification challenge in the Sandbox, set the token to cnon:card-nonce-requires-verification.
    intent = 'CHARGE', // or 'STORE'
    billingContact, // { givenName, familyName }
    amount, // Only required for charge
    currencyCode, // Only required for charge
  }
) {
  console.debug('Verifying Buyer');
  const detailsToVerify = {
    intent,
    billingContact,
  };

  try {
    if (intent === 'CHARGE') {
      detailsToVerify.amount = amount;
      detailsToVerify.currencyCode = currencyCode;
    }
    // token = 'cnon:card-nonce-requires-verification';
    const verificationDetails = await payments.verifyBuyer(
      token,
      detailsToVerify
    );
    console.debug('Successfully Verified Buyer', verificationDetails);

    return verificationDetails;
  } catch (e) {
    console.error('Buyer Verification Failed', e);
    return false;
  }
}

export { initializeCard, verifyBuyer, createDeferredCardPayment };

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

function bindCardToTrigger(card, { event, triggerSelector }) {
  // TODO: can we disable the submit button until we have a valid CC input?
  // Checkpoint 3.1.1
  return new Promise((resolve) => {
    console.log('Bind card to event listener');
    // Get trigger
    const triggerElement = document.querySelector(triggerSelector);
    // When the buyer triggers tokenization, we will resolve the promise with the tokenResult
    triggerElement.addEventListener(
      event,
      async () => {
        try {
          console.log('Attempt tokenizing Card');

          const tokenResult = await card.tokenize();
          if (tokenResult.status === 'OK') {
            console.log('Tokenized Card successfully', tokenResult);

            resolve(tokenResult);
            return;
          }
          // We don't need to take any action, additional buyer input may allow a complete tokenization
          // So long as we do not resolve the promise, buyers can continue to attempt submission
          console.log('Card Tokenization incomplete', tokenResult);
        } catch (e) {
          console.error('Something went wrong tokenizing Card', e);
        }
      },
      {
        // We only want this to bind for one event so we can rebind safely if we encounter an error
        once: true,
      }
    );
  });
}

async function verifyBuyer(
  payments,
  {
    token,
    amount, // '1.00'
    currencyCode, // 'USD'
    givenName, // 'Jane'
    familyName, // 'Smith'
    intent = 'CHARGE', // or 'STORE'
  }
) {
  console.log('Verifying Buyer');
  // To force a verification challenge in the Sandbox, set the token to cnon:card-nonce-requires-verification.
  const verificationDetails = await payments.verifyBuyer(token, {
    intent,
    amount,
    currencyCode,
    billingContact: {
      givenName,
      familyName,
    },
  });
  console.log('Successfully Verified Buyer', verificationDetails);

  return verificationDetails;
}

export { initializeCard, verifyBuyer, bindCardToTrigger };

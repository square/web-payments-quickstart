export default function bindPaymentMethodToTrigger(
  paymentMethod,
  { event, triggerSelector, methodName }
) {
  // TODO: can we disable the submit button until we have a valid CC input?
  // Checkpoint 3.1.1
  return new Promise((resolve) => {
    console.log(`Bind ${methodName} to event listener`);
    // Get trigger
    const triggerElement = document.querySelector(triggerSelector);
    // When the buyer triggers tokenization, we will resolve the promise with the tokenResult
    triggerElement.addEventListener(
      event,
      async () => {
        // Checkpoint 3.1.X - Add SCA.
        try {
          console.log(`Attempt tokenizizing ${methodName}`);
          // TODO: link to tokenResult docs.
          const tokenResult = await paymentMethod.tokenize();
          if (tokenResult.status === 'OK') {
            console.log(`Tokenized ${methodName} successfully`, tokenResult);
            resolve(tokenResult);
            return;
          }
          // We don't need to take any action, additional buyer input may allow a complete tokenization
          // So long as we do not resolve the promise, buyers can continue to attempt submission
          console.log(`${methodName} Tokenization incomplete`, tokenResult);
        } catch (e) {
          console.error(`Something went wrong tokenizing ${methodName}`, e);
        }
      },
      {
        // We only want this to bind for one event so we can rebind safely if we encounter an error
        once: true,
      }
    );
  });
}

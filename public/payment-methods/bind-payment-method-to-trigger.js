export default function bindPaymentMethodToTrigger(
  paymentMethod,
  { event, triggerSelector, methodName }
) {
  return new Promise((resolve) => {
    console.log(`Bind ${methodName} to event listener`);
    // Get trigger
    const triggerElement = document.querySelector(triggerSelector);
    // When the buyer triggers tokenization, we will resolve the promise with the tokenResult
    // Promises can only resolve or reject once, so we don't resolve unless we succeed or catastrophically fail.
    // We want to give the Buyer as many chances to correctly enter their information as we can.
    triggerElement.addEventListener(event, async () => {
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
        // We strongly recommend logging errors and reporting any that you encounter in production.
        // Notice that we don't reject.
        console.error(`Something went wrong tokenizing ${methodName}`, e);
      }
    });
  });
}

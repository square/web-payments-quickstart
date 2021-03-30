export default async function createPayment(tokenResult) {
  console.log('POST to /payment');
  const createPaymentResponse = await fetch('/payment', {
    method: 'POST',
    body: {
      tokenResult,
    },
  }).then((response) => response.json());

  console.log('POST to /payment complete', createPaymentResponse);
  return createPaymentResponse;
}

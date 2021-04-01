export default async function createPayment({
  tokenResult,
  verificationDetails,
  locationId,
  idempotencyKey,
}) {
  const body = JSON.stringify({
    tokenResult,
    verificationDetails,
    locationId,
    idempotencyKey,
  });

  console.log('POST to /payment', body);
  const createPaymentResponse = await fetch('/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })
    .then((response) => {
      console.log(response);
      return response.json();
    })
    .catch((e) => {
      console.error('Something went wrong processing the payment', e);
    });

  console.log('POST to /payment complete', createPaymentResponse);
  return createPaymentResponse;
}

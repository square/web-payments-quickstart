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

  console.debug('POST to /payment', JSON.parse(body));
  const createPaymentResponse = await fetch('/payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })
    .then((response) => {
      console.debug(response);
      return response.json();
    })
    .catch((e) => {
      console.error('Something went wrong processing the payment', e);
    });

  console.debug('POST to /payment complete', createPaymentResponse);
  return createPaymentResponse;
}

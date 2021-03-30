// pass in payments rather than initializing for each payment method
// Checkpoint 1.2.1
async function initializeCard({ payments, targetElementOrSelector }) {
  // Card can be customized here.
  console.log('Initialize Card');
  const card = await payments.card();

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

export { initializeCard };

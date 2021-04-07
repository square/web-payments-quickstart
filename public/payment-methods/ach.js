import createPayment from '../services/create-payment.js';
import { getBillingContact } from '../helpers/form.js';

async function initializeAch({ payments, paymentRequest }) {
  const ach = await payments.ach(paymentRequest);

  // Similar to Apple Pay, ACH has no attach method
  // The Plaid Auth flow will be triggered by .tokenize(...)

  return ach;
}

async function createAchPayment(ach, { idempotencyKey, billingContact }) {
  const accountHolderName = [
    billingContact.givenName,
    billingContact.familyName,
  ].join(' ');

  const tokenResult = await ach.tokenize({ accountHolderName });

  if (tokenResult.status === 'OK') {
    const paymentResult = await createPayment({
      tokenResult,
      idempotencyKey,
    });

    if (paymentResult) {
      return paymentResult;
    }
  }

  return false;
}

function createAchPaymentOnFormSubmit(ach, paymentDetails) {
  const achForm = document.querySelector('#ach-form');
  const event = 'submit';
  return new Promise((resolve) => {
    achForm.addEventListener(event, async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // disable form submission
      const submitButton = achForm.querySelector('button[type="submit"]');
      submitButton.disabled = true;

      const billingContact = getBillingContact(achForm);

      const paymentResult = await createAchPayment(ach, {
        billingContact,
        ...paymentDetails,
      });

      if (paymentResult) {
        resolve(paymentResult);
      }

      // Re-enable the button if we don't succeed
      submitButton.disabled = false;
    });
  });
}

export { initializeAch, createAchPaymentOnFormSubmit };

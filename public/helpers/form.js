function getBillingContact(form) {
  const formData = new FormData(form);
  const billingContact = {
    givenName: formData.get('givenName'),
    familyName: formData.get('familyName'),
  };

  return billingContact;
}

export { getBillingContact };

const test = require('ava');
const micro = require('micro');
const listen = require('test-listen');
const fetch = require('node-fetch');

const main = require('.');

// serveStatic
[
  ['/', /Quickstart/],
  ['/payments.js', /window.Square/],
  ['/favicon.ico', /.+/],
].forEach(([path, re]) => {
  test(`serves ${path}`, async (t) => {
    const service = micro(main);
    const url = await listen(service);
    const res = await fetch(url + path);
    t.true(res.ok);

    const body = await res.text();
    t.regex(body, re);

    service.close(t.falsy);
  });
});

// createPayment
test('createPayment errors with invalid payload', async (t) => {
  const service = micro(main);
  const url = await listen(service);
  const res = await fetch(`${url}/payment`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      wrong: true,
    }),
  });

  // expect 'bad request' response because body is wrong (literally)
  t.false(res.ok);
  t.is(res.status, 400);

  service.close(t.falsy);
});

test('createPayment tries to create payment with valid payload', async (t) => {
  const service = micro(main);
  const url = await listen(service);
  const res = await fetch(`${url}/payment`, {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: 100,
      locationId: '🌉',
      sourceId: 't0k3n',
    }),
  });

  // expect 'unauthroized' response because no access token (from .env) or sourceId
  t.false(res.ok);
  t.is(res.status, 401);

  service.close(t.falsy);
});

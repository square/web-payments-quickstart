// micro provides http helpers
const { createError, json } = require('micro');
// microrouter provides http server routing
const { router, get, post } = require('microrouter');
// serve-handler serves static assets
const staticHandler = require('serve-handler');
// nanoid generates random identifiers
const { nanoid } = require('nanoid');
// async-retry will retry failed API requests
const retry = require('async-retry');

// logger gives us insight into what's happening
const logger = require('./server/logger');
// schema validates incoming requests
const { validatePaymentPayload } = require('./server/schema');
// square provides the API client and error types
const { ApiError, client: square } = require('./server/square');

async function createPayment(req) {
  const payload = await json(req);

  if (!validatePaymentPayload(payload)) {
    throw createError(400, 'Bad Request');
  }

  // See: https://developer.squareup.com/docs/working-with-apis/idempotency
  const idempotencyKey = nanoid();

  await retry(async (bail, attempt) => {
    try {
      logger.debug('Creating payment', { attempt, idempotencyKey });

      const { result, statusCode } = await square.paymentsApi.createPayment({
        idempotencyKey,
        amountMoney: {
          amount: payload.amount,
          currency: 'USD', // IDEA: multiple currencies
        },
        locationId: payload.locationId,
        sourceId: payload.sourceId,
      });

      logger.info('Payment succeeded!', { result, statusCode });
    } catch (ex) {
      if (ex instanceof ApiError) {
        // likely an error in the request. don't retry
        logger.error(ex.errors);
        bail(ex);
      } else {
        // IDEA: send to error reporting service
        logger.error(`Error creating payment on attempt ${attempt}: ${ex}`);
        throw ex; // to attempt retry
      }
    }
  });

  return { success: true };
}

// server static files like index.html and favicon.ico from public/ directory
async function serveStatic(req, res) {
  logger.debug('Handling request', req.path);
  await staticHandler(req, res, {
    public: 'public',
  });
}

// export routes to be served by micro
module.exports = router(
  post('/payment', createPayment),
  get('/*', serveStatic)
);

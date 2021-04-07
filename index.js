// micro provides http helpers
const { json, send } = require('micro');
// microrouter provides http server routing
const { router, get, post } = require('microrouter');
// serve-handler serves static assets
const staticHandler = require('serve-handler');
// async-retry will retry failed API requests
const retry = require('async-retry');

// logger gives us insight into what's happening
const logger = require('./server/logger');
// schema validates incoming requests
// square provides the API client and error types
const { ApiError, client: square } = require('./server/square');
const { nanoid } = require('nanoid');

async function createPayment(req, res) {
  const payload = await json(req);
  console.debug(JSON.stringify(payload));

  await retry(async (bail, attempt) => {
    try {
      logger.debug('Creating payment', { attempt });

      const payment = {
        idempotencyKey: nanoid(),
        locationId: payload.locationId,
        sourceId: payload.tokenResult.token,
        // While it's tempting to pass this data from the client
        // Doing so allows bad actor to modify these values
        // Instead, leverage Orders to create an order on the server
        // and pass the Order ID to createPayment rather than raw amounts
        amountMoney: {
          amount: '100',
          currency: 'USD',
        },
      };

      if (payload.verificationDetails && payload.verificationDetails.token) {
        payment.verificationToken = payload.verificationDetails.token;
      }

      const { result, statusCode } = await square.paymentsApi.createPayment(
        payment
      );

      logger.info('Payment succeeded!', { result, statusCode });

      send(res, statusCode, {
        success: true,
        payment: {
          id: result.payment.id,
          status: result.payment.status,
          receiptUrl: result.payment.receiptUrl,
          orderId: result.payment.orderId,
        },
      });
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
}

// serve static files like index.html and favicon.ico from public/ directory
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

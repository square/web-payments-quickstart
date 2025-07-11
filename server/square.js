const { SquareError, SquareClient, SquareEnvironment } = require('square');

const { isProduction, SQUARE_ACCESS_TOKEN } = require('./config');

const client = new SquareClient({
  environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
  token: SQUARE_ACCESS_TOKEN,
});

module.exports = { SquareError, client };

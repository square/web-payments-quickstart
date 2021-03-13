const debug = require('debug');

module.exports = {
  // IDEA: replace console with more robust logger
  info: console.info,
  error: console.error,
  debug: debug('sq-web-pay'),
};

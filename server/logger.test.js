const test = require('ava');

const logger = require('./logger');

['info', 'error', 'debug'].forEach((fn) => {
  test(`exports ${fn}`, (t) => {
    t.true(typeof logger[fn] === 'function');
  });
});

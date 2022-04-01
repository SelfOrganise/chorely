const { addDays } = require('date-fns');

function t(days) {
  return addDays(new Date(), days).toISOString();
}

module.exports = { t };

'use strict'
const Express = require('express');

module.exports = function (models) {

  var app = Express();

  app.use(require('./warehouse')(models));
  app.use(require('./product_info')(models));
  app.use(require('./stock')(models));
  app.use(require('./product')(models));
  app.use(require('./stock_movement')(models));

  return app;

}

'use strict'
const Sequelize = require('sequelize');

module.exports = function (connection) {

  var models = {};

  models.Warehouse = connection.define('warehouse', {
    id : {
      type : Sequelize.INTEGER,
      primaryKey : true,
      autoIncrement : true
    },
    name : {
      type : Sequelize.STRING
    }
  });

  models.ProductInfo = connection.define('product_info', {
    id : {
      type : Sequelize.INTEGER,
      primaryKey : true,
      autoIncrement : true
    },
    name : {
      type : Sequelize.STRING
    }
  });

  models.Product = connection.define('product', {
    id : {
      type : Sequelize.INTEGER,
      primaryKey : true,
      autoIncrement : true
    },
    serial : Sequelize.STRING,
  });
  models.Product.belongsTo(models.ProductInfo);
  models.Product.belongsTo(models.Warehouse, { as : 'location'});

  models.Stock = connection.define('stock', {
    id : {
      type : Sequelize.INTEGER,
      primaryKey : true,
      autoIncrement : true
    },
    quantity : {
      type : Sequelize.INTEGER, 
      defaultValue : 1
    }
  });

  models.Stock.belongsTo(models.Warehouse);
  models.Stock.belongsTo(models.ProductInfo);

  models.StockMovement = connection.define('stock_movement', {
    id : {
      type : Sequelize.INTEGER,
      primaryKey : true,
      autoIncrement : true
    },
    movementDate : {
      type : Sequelize.DATE,
      defaultValue : Sequelize.NOW
    }
  });

  models.StockMovement.belongsTo(models.Warehouse, { as : 'source'});
  models.StockMovement.belongsTo(models.Warehouse, { as : 'target'});
  models.StockMovement.belongsTo(models.Product);

  return models;
}

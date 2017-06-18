'use strict'
const Express = require('express');

function getMovementsFromTo(models, from, to, callback) {

  models.StockMovement.findAll({
    include : [
      {
        model : models.Warehouse,
        as : 'source'
      },
      {
        model : models.Warehouse,
        as : 'target'
      },
      {
        model : models.Product
      }
    ],
    where : {
      movementDate : {
        $between : [
          from,
          to
        ]
      }
    }
  })
  .then(function (result) {
    var list = [];
    for (var index in result) {
      list.push(result[index].dataValues);
    }
    return callback(null, list);
  })
  .catch(function(err) {
    return callback(err);
  });

}

module.exports = function (models) {

  var app = Express();

  app.get('/api/stock_movement', function (req, res) {

    models.StockMovement.findAll(
    {
      include : [
        {
          model : models.Warehouse,
          as : 'source'
        },
        {
          model : models.Warehouse,
          as : 'target'
        },
        {
          model : models.Product
        }
      ]
    }
  )
      .then(function(result) {
        var list = [];
        for (var index in result) {
          list.push(result[index].dataValues);
        }
        res.status(200).json(list).end();
      })
      .catch(function(err) {
        res.status(500).json({ message : err}).end();
      });
  });

  app.get('/api/stock_movement/:id', function (req, res) {

    models.StockMovement.findById(parseInt(req.params.id), {
      include : [
        {
          model : models.Warehouse
        },
        {
          model : models.Product
        }
      ]
    })
      .then(function (result){
        if (!result)
          return res.status(404).json({ message : 'Record not found.'}).end();
        return res.status(200).json(result.dataValues).end();
      })
      .catch(function(err) {
        return res.status(500).json({ message : err }).end();
      });
  });

  app.get('/api/stock_movement/product/:id', function (req, res) {

    models.StockMovement.findAll({
      where : {
        productId : parseInt(req.params.id)
      }
    })
    .then(function (result) {
      var list = [];
      for (var index in result) {
        list.push(result[index].dataValues);
      }
      res.status(200).json(list).end();
    })
    .catch(function(err) {
      return res.status(500).json({ message : err }).end();
    });

  });

  app.get('/api/stock_movement/date/:date', function (req, res) {

    const patter = new RegExp("[0-9]{4}\-[0-9]{2}\-[0-9]{2}");

    if (!patter.test(req.params.date))
      return res.status(500).json({ message : `Date format invalid "${req.params.date}"`});

    var dateComponents = req.params.date.split('-');
    const year = parseInt(dateComponents[0]);
    const month = parseInt(dateComponents[1]) - 1;
    const day = parseInt(dateComponents[2]);
    const from = new Date(year, month, day, -3, 0, 0);
    const to = new Date(year, month, day, 20, 59, 59);

    getMovementsFromTo(models, from, to, function (err, result) {
      if (err)
        return res.status(500).json( { message : err }).end();
      return res.status(200).json(result).end();
    });

  });

  app.get('/api/stock_movement/from/:from/to/:to', function (req, res) {

    const pattern = new RegExp("[0-9]{4}\-[0-9]{2}\-[0-9]{2}");

    if (!pattern.test(req.params.from))
      return res.status(500).json({ message : `Date format invalid "${req.params.from}"`});

    if (!pattern.test(req.params.to))
    return res.status(500).json({ message : `Date format invalid "${req.params.to}"`});

    var dateComponents = req.params.from.split('-');
    var year = parseInt(dateComponents[0]);
    var month = parseInt(dateComponents[1]) - 1;
    var day = parseInt(dateComponents[2]);
    const from = new Date(year, month, day, -3, 0, 0);
    dateComponents = req.params.to.split('-');
    year = parseInt(dateComponents[0]);
    month = parseInt(dateComponents[1]) - 1;
    day = parseInt(dateComponents[2]);
    const to = new Date(year, month, day, 20, 59, 59);

    getMovementsFromTo(models, from, to, function (err, result) {
      if (err)
        return res.status(500).json( { message : err }).end();
      return res.status(200).json(result).end();
    });

  });

  app.post('/api/stock_movement', function (req, res) {
    models.StockMovement.create(req.body)
      .then(function (result) {
        return res.status(200).json(result).end();
      })
      .catch(function (err) {
        return res.status(500).json({message : err}).end();
      })
  });

  // app.post('/api/stock_movement/entry', function (req, res) {
  //
  //   if (!req.body.productInfoId)
  //     return res.status(500).json({ message : 'Must specify productInfo Id.'}).end();
  //
  //   if (!req.body.targetWarehouseId)
  //     return res.status(500).json({ message : 'Must specify target warehouse.'}).end();
  //
  //   if (!req.body.serial)
  //     return res.status(500).json({ message : "Must specify product's serial."}).end();
  //
  //   const productInfoId = parseInt(req.body.productInfoId);
  //   const targetWarehouseId = parseInt(req.body.targetWarehouseId);
  //
  //   models.ProductInfo.findById(productInfoId)
  //   .then(function (productInfo) {
  //
  //     if (!productInfo)
  //       return res.status(404).json({ message : 'ProductInfo not found.'}).end();
  //
  //     models.Warehouse.findById(targetWarehouseId)
  //     .then(function (warehouse) {
  //
  //       if (!warehouse)
  //         return res.status(404).json({ message : 'Warehouse not found.'}).end();
  //
  //       models.Product.findAll({
  //         where : {
  //           serial : req.body.serial
  //         }
  //       })
  //       .then(function (product) {
  //         if (product.length > 0)
  //           return res.status(500).json({ message : `A product with serial ${req.body.serial} already exists.`}).end();
  //
  //         models.Product.create({
  //           productInfoId : productInfoId,
  //           serial : req.body.serial,
  //           locationId : targetWarehouseId
  //         })
  //         .then(function(product) {
  //
  //           models.Stock.findOrCreate({
  //             where : {
  //               productInfoId : productInfoId,
  //               warehouseId : targetWarehouseId
  //             }
  //           })
  //           .then(function(stock, created) {
  //
  //             stock[0].update({
  //               quantity : (!stock[1]) ? stock[0].dataValues.quantity + 1 : stock[0].dataValues.quantity
  //             })
  //             .then(function (stock) {
  //               models.StockMovement.create({
  //                 sourceId : null,
  //                 targetId : targetWarehouseId,
  //                 productId : product.dataValues.id
  //               })
  //               .then(function(stockMovement) {
  //                 return res.status(200).json(stockMovement).end();
  //               })
  //               .catch(function (err) {
  //                 return res.status(500).json({ message : err}).end();
  //               });
  //             })
  //             .catch(function (err) {
  //               return res.status(500).json({ message : err}).end();
  //             });
  //           })
  //           .catch(function(err) {
  //             return res.status(500).json({ message : err}).end();
  //           });
  //         })
  //         .catch(function(err){
  //           return res.status(500).json({ message : err}).end();
  //         });
  //       })
  //       .catch(function (err) {
  //         return res.status(500).json({ message : err}).end();
  //       });
  //     })
  //     .catch(function (err) {
  //       return res.status(500).json({ message : err}).end();
  //     });
  //   })
  //   .catch(function (err) {
  //     return res.status(500).json({ message : err }).end();
  //   });
  //
  // });

  app.post('/api/stock_movement/entry', function (req, res) {

    if (!req.body.productInfoId)
      return res.status(500).json({ message : 'Must specify productInfo Id.'}).end();

    if (!req.body.targetWarehouseId)
      return res.status(500).json({ message : 'Must specify target warehouse.'}).end();

    if (!req.body.serial)
      return res.status(500).json({ message : "Must specify product's serial."}).end();

    const productInfoId = parseInt(req.body.productInfoId);
    const targetWarehouseId = parseInt(req.body.targetWarehouseId);

    models.ProductInfo.findById(productInfoId)
    .then(function (productInfo) {

      if (!productInfo)
        throw Error('ProductInfo not found.');

      models.Warehouse.findById(targetWarehouseId)
      .then(function (warehouse) {

        if (!warehouse)
          throw Error('Warehouse not found.');

        return models.Product.findAll({
          where : {
            serial : req.body.serial
          }
        });
      })
      .then(function (product) {
        if (product.length > 0)
          throw Error(`A product with serial ${req.body.serial} already exists.`);

        return models.Product.create({
          productInfoId : productInfoId,
          serial : req.body.serial,
          locationId : targetWarehouseId
        })
      })
      .then(function (product) {
        return models.StockMovement.create({
          sourceId : null,
          targetId : targetWarehouseId,
          productId : product.dataValues.id
        });
      })
      .then(function(stockMovement) {

        return models.Stock.findOrCreate({
            where : {
              productInfoId : productInfoId,
              warehouseId : targetWarehouseId
            }
        });
      })
      .then(function(stock, created) {

        return stock[0].update({
            quantity : (!stock[1]) ? stock[0].dataValues.quantity + 1 : stock[0].dataValues.quantity
        });
      })
      .then(function(stockMovement) {
        return res.status(200).json(stockMovement).end();
      })
      .catch(function (err) {
        return res.status(500).json({ message : err }).end();
      });

    });

  });

  app.post('/api/stock_movement/product/:id/from/:source/to/:target', function (req, res) {

    if (!req.params.id)
      return res.status(500).json({ message : "Must specify product's id" }).end();

    if (!req.params.source)
      return res.status(500).json({ message : "Must specify source warehouse."}).end();

    if (!req.params.target)
      return res.status(500).json({ message : "Must specify target warehouse."}).end();

    if(req.params.source == req.params.target)
      return res.status(500).json({ message : "Source and taget must are differents."}).end();

    const productId = parseInt(req.params.id);
    const sourceWarehouseId = parseInt(req.params.source);
    const targetWarehouseId = parseInt(req.params.target);

    models.Product.findAll({
      where : {
        id : productId,
        locationId : sourceWarehouseId
      }
    })
      .then(function(product){

        if (!product || product.length == 0)
          return res.status(404).json({ message : 'Product not found or not exists on source warehouse or the source warehouse not exists.'}).end();

        // Verify source warehouse existence
        models.Warehouse.findById(sourceWarehouseId)
          .then(function (sourceWarehouse) {

            if (!sourceWarehouse)
              return res.status(404).json({ message : 'Source warehouse not found.'}).end();

            // Verify target warehouse existence
            models.Warehouse.findById(targetWarehouseId)
              .then(function (targetWarehouse) {

                if (!targetWarehouse)
                  return res.status(404).json({ message : 'Target warehouse not found.'}).end();

                // Create stock movement
                models.StockMovement.create({
                  sourceId : sourceWarehouseId,
                  targetId : targetWarehouseId,
                  productId : product[0].dataValues.id
                })
                  .then(function (stockMovement) {

                    // Update product location
                    product[0].update({
                      locationId : targetWarehouseId
                    })
                      .then(function(product) {

                        // Find or Create target stock summary
                        models.Stock.findOrCreate({
                          where : {
                            warehouseId: product.dataValues.locationId,
                            productInfoId : product.dataValues.productInfoId
                          }
                        })
                          .then (function (stockTarget) {

                            // Update target stock summary
                            stockTarget[0].update({
                              quantity : stockTarget[0].dataValues.quantity + 1
                            })
                              .then(function (dummy) {

                                // Find or Create source stock summary
                                models.Stock.findOrCreate({
                                  where : {
                                    warehouseId: sourceWarehouseId,
                                    productInfoId : product.dataValues.productInfoId
                                  }
                                })
                                  .then (function (stockSource) {

                                    // Update source stock summary
                                    stockSource[0].update({
                                      quantity : stockSource[0].dataValues.quantity - 1
                                    })
                                      .then(function (stockDummy) {
                                          return res.status(200).json(stockMovement.dataValues).end();
                                      })
                                      .catch(function (err) {
                                        return res.status(500).json({ message : err }).end();
                                      });
                                  })
                                  .catch(function (err) {
                                    return res.status(500).json({ message : err }).end();
                                  });

                              })
                              .catch(function (err) {
                                return res.status(500).json({ message : err }).end();
                              });
                          })
                          .catch(function (err) {
                            return res.status(500).json({ message : err }).end();
                          });
                      })
                      .catch(function (err) {
                        return res.status(500).json({ message : err }).end();
                      });
                  })
                  .catch(function (err) {
                    return res.status(500).json({ message : err }).end();
                  });

              })
              .catch(function (err) {
                return res.status(500).json({ message : err }).end();
              });

          })
          .catch(function(err) {
            return res.status(500).json({ message : err }).end();
          });

      })
      .catch(function(err) {
        return res.status(500).json({ message : err}).end();
      });
  });

  app.put('/api/stock_movement/:id', function (req, res) {

    models.StockMovement.findById(req.params.id)
      .then(function (instance) {
        if (!instance)
          return res.status(404).json({ message : 'Record not found.'}).end();
        return instance.update(req.body)
          .then(function (result) {
            return res.status(200).json(result).end();
          })
          .catch(function (err) {
            return res.status(500).json({ message : err }).end();
          });
      });
  });

  return app;

}

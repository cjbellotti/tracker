'use strict'
const Express = require('express');

module.exports = function (models) {

  var app = Express();

  app.get('/api/product', function (req, res) {

    models.Product.findAll({
      include : [
        {
          model : models.ProductInfo
        },
        {
          model : models.Warehouse,
          as : 'location'
        }
      ]
    })
      .then(function(result) {
        var list = [];
        for (var index in result) {
          list.push(result[index].dataValues);
        }
        res.status(200).json(list).end();
      })
      .catch(function(err, b) {
        res.status(500).json({ message : err, b: b}).end();
      });
  });

  app.get('/api/product/:id', function (req, res) {

    models.Product.findById(parseInt(req.params.id), {
      include : [
        {
          model : models.ProductInfo
        }
      ]
    })
      .then(function (result){

        if (!result)
          return res.status(404).json({ massage : 'Record not found.' }).end();
        return res.status(200).json(result.dataValues).end();

      })
      .catch(function(err) {
        res.status(500).json({ message : err}).end();
      });
  });

  app.post('/api/product', function (req, res) {
    models.Product.create(req.body)
      .then(function (result) {
        return res.status(200).json(result.dataValues).end();
      })
      .catch(function (err) {
        res.status(500).json({message : err}).end();
      })
  });

  app.put('/api/product/:id', function (req, res) {

    models.Product.findById(req.params.id)
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

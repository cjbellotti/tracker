'use strict'
const Express = require('express');

module.exports = function (models) {

  var app = Express();

  app.get('/api/warehouse', function (req, res) {

    models.Warehouse.findAll()
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

  app.get('/api/warehouse/:id', function (req, res) {

    models.Warehouse.findById(req.params.id)
      .then(function (result){
        if (!result)
          return res.status(404).json( { message : 'Record not found. '} ).end();
        return res.status(200).json(result.dataValues).end();
      })
      .catch(function(err) {
        return res.status(500).json({ message : err }).end();
      });
  });

  app.post('/api/warehouse', function (req, res) {
    models.Warehouse.create(req.body)
      .then(function (result) {
        res.status(200).json(result).end();
      })
      .catch(function (err) {
        res.status(500).json({message : err}).end();
      })
  });

  app.put('/api/warehouse/:id', function (req, res) {

    models.Warehouse.findById(req.params.id)
      .then(function (instance) {
        if (!instance)
          return res.status(404).json( { message : 'Record not found.'}).end();
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

'use strict'
const Sequelize = require('sequelize');
const Express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const port = process.env.PORT || 3000;

const connection = new Sequelize('tracker', 'tracker', 'tracker123', {
  host : 'localhost',
  dialect : 'mysql'
});

const models = require('./models/models')(connection);

const app = Express();
app.use(bodyParser.urlencoded({extended : false}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(Express.static(__dirname + '/public'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(require('./services')(models));

app.post('/api/stock_movement/movements', function (req, res) {

  var from = null;
  var to = null;
  var where = []
  if (req.body.fromDate && req.body.toDate) {

    var dateComponents = req.body.fromDate.split('-');
    var year = dateComponents[0];
    var month = dateComponents[1];
    var day = dateComponents[2];
    from = `${year}-${month}-${day} 00:00:01`;
    dateComponents = req.body.toDate.split('-');
    year = dateComponents[0];
    month = dateComponents[1];
    day = dateComponents[2];
    to = `${year}-${month}-${day} 23:59:59`;

    where.push (`MOVEMENTDATE BETWEEN '${from}' AND '${to}'`);

  }

  if (req.body.productInfoId && req.body.productInfoId > 0) {
    where.push (`P.PRODUCTINFOID = ${req.body.productInfoId}`);
  }

  if (req.body.serial && req.body.serial.length > 0) {
    where.push (`P.SERIAL = '${req.body.serial}'`);
  }

  if (req.body.warehouseId && req.body.warehouseId > 0) {
    where.push (`(SM.SOURCEID = ${req.body.warehouseId} OR SM.TARGETID = ${req.body.warehouseId})`);
  }

  var query = `
                  SELECT  SM.MOVEMENTDATE as date,
                         W2.NAME as source,
                         PI.NAME as product,
                         P.SERIAL as serial,
                         W1.NAME as target
                          FROM STOCK_MOVEMENTS SM
                          INNER JOIN PRODUCTS P ON P.ID = SM.PRODUCTID
                          INNER JOIN PRODUCT_INFOS PI ON PI.ID = P.PRODUCTINFOID
                          INNER JOIN WAREHOUSES W1 ON W1.ID = SM.TARGETID
                          LEFT JOIN WAREHOUSES W2 ON W2.ID = SM.SOURCEID
                    `;
  if (where.length > 0) {
    query = query + ' WHERE ' + where.join(' AND ');
  }

  query = query + ' ORDER BY SM.MOVEMENTDATE';
  connection.query(query).spread((results, metadata)=> {
    res.status(200).json(results).end();
  });

});

app.post('/api/test', function (req, res) {
    connection.query("SELECT * FROM STOCKS S INNER JOIN WAREHOUSES W ON W.ID = S.WAREHOUSE_ID INNER JOIN PRODUCT_INFOS PI ON PI.ID = S.PRODUCT_INFO_ID WHERE S.ID = 1")
      .then(function(result) {
        res.status(200).json(result).end();
      });
});

connection.sync().then(() => {
  app.listen(port, function() {
    console.log(`Server listening on port ${port}...`);
  })
});

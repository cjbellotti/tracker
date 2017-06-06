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
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(require('./services')(models));

app.post('/api/test', function (req, res) {
    connection.query("SELECT * FROM STOCKS S INNER JOIN WAREHOUSES W ON W.ID = S.WAREHOUSE_ID INNER JOIN PRODUCT_INFOS PI ON PI.ID = S.PRODUCT_INFO_ID WHERE S.ID = 1")
      .then(function(result) {
        res.status(200).json(result).end();
      });
});
/*const Warehouse = connection.define('warehouse', {
  id : {
    type : Sequelize.INTEGER,
    primaryKey : true,
    autoIncrement : true
  },
  name : {
    type : Sequelize.STRING
  }
});

const ProductInfo = connection.define('product_info', {
  id : {
    type : Sequelize.INTEGER,
    primaryKey : true,
    autoIncrement : true
  },
  name : {
    type : Sequelize.STRING
  }
});

const Product = connection.define('product', {
  id : {
    type : Sequelize.INTEGER,
    primaryKey : true,
    autoIncrement : true
  },
  product_info_id : {
    type : Sequelize.INTEGER,
    references : {
      model : ProductInfo,
      key : 'id'
    }
  }
});

const Stock = connection.define('stock', {
  id : {
    type : Sequelize.INTEGER,
    primaryKey : true,
    autoIncrement : true
  },
  warehouse_id : {
    type : Sequelize.INTEGER,
    references : {
        model : Warehouse,
        key : 'id'
    }
  },
  product_info_id : {
    type : Sequelize.INTEGER,
    references : {
      model : ProductInfo,
      key : 'id'
    }
  },
  quantity : Sequelize.INTEGER
});

const StockMovement = connection.define('stock_movement', {
  id : {
    type : Sequelize.INTEGER,
    primaryKey : true,
    autoIncrement : true
  },
  warehouse_source_id : {
    type : Sequelize.INTEGER,
    references : {
      model : Warehouse,
      key : 'id'
    }
  },
  warehouse_target_id : {
    type : Sequelize.INTEGER,
    references : {
      model : Warehouse,
      key : 'id'
    }
  },
  product_id : {
    type : Sequelize.INTEGER,
    references : {
      model : Product,
      key : 'id'
    }
  },
  movementDate : {
    type : Sequelize.DATE,
    defaultValue : Sequelize.NOW
  }
});*/

connection.sync().then(() => {
  app.listen(port, function() {
    console.log(`Server listening on port ${port}...`);
  })
});

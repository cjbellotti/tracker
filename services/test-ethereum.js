'use strict'

var ethereum = require('./ethereum');

// ethereum.createProductIntance('POED1503', 9)
//   .then(productHash => {
//     console.log(`Product hash: ${productHash}`);
//   });

ethereum.changeProductWarehouse('0x3cE016A49eeA26247a958d311C2d70E790Fa9d59',19,14)
.then(result => console.log(result));

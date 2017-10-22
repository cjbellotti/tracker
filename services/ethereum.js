'use strict'

const Web3 = require('web3');
const fs = require('fs');
const ethereumConfig = require('../conf/ethereum.conf.json');
const ProductABI = JSON.parse(fs.readFileSync(__dirname + '/../contracts/build/Product.abi'));
var byteCode = fs.readFileSync(__dirname + '/../contracts/build/Product.bin');
const ProductByteCode = new String(byteCode).replace(/\n/g, '');

var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));

exports.createProductIntance = (serial, warehouse) => {
  return web3.eth.personal.unlockAccount(ethereumConfig.coinbase, ethereumConfig.password)
    .then(() => {
      return new web3.eth.Contract(ProductABI);
    })
    .then(ProductContract => {
      return ProductContract.deploy({
        data : '0x' + ProductByteCode,
        arguments : [serial, warehouse]
      });
    })
    .then(tx => {
      return tx.send({
        from : ethereumConfig.coinbase,
        gas : 4700000
      });
    })
    .then(instance => {
      return instance._address;
    });
}

exports.changeProductWarehouse = (productHash, actualWarehouse, newWarehouse) => {

  const productIntance = new web3.eth.Contract(ProductABI, productHash);

  return web3.eth.personal.unlockAccount(ethereumConfig.coinbase, ethereumConfig.password)
    .then(() => {
      return productIntance.methods.setWarehouse(actualWarehouse, newWarehouse).send({
            from : ethereumConfig.coinbase
      });
    })
    .then(result => {
      return result.status == '0x1';
    });

}

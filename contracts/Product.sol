pragma solidity ^0.4.0;

contract Product {

  address owner;
  string serial;
  uint warehouse;

  function Product(string _serial, uint _warehouse) {
    owner = msg.sender;
    serial = _serial;
    warehouse = _warehouse;
  }

  function getWarehouse() public returns (uint) {
    return warehouse;
  }

  function setWarehouse(uint _actualWarehouse, uint _warehouse) canAccess {
    require(warehouse == _actualWarehouse);
    warehouse = _warehouse;
  }

  function getSerial() returns (string) {
      return serial;
  }

  modifier canAccess() {
    bool success = false;
    if (owner == msg.sender) {
      success = true;
    }
    require(success);
    _;
  }
}

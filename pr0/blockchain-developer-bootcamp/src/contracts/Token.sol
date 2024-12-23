// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Token {
    // Variables
    string public name = "BlockZen";
    string public symbol = "BZen";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Track Balance
    mapping(address => uint256) public balanceOf;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Send Tokens
    constructor() {
        totalSupply = 1000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }

function transfer(address _to, uint256 _value) public returns (bool success) {
    require(balanceOf[msg.sender] >= _value, "Insufficient balance");  // Add the revert message here
    require(_to != address(0), "Invalid address");
    balanceOf[msg.sender] -= _value;
    balanceOf[_to] += _value;
    emit Transfer(msg.sender, _to, _value);
    return true;
}

}

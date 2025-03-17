// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.7.1;
pragma experimental ABIEncoderV2;

contract Migrations {
    address public owner;
    uint public last_Completed_Migration;

    constructor() {
        owner = msg.sender;
    }

    modifier restricted() {
        require(msg.sender == owner, "You are not the owner.");
        _;
    }

    function setCompleted(uint completed) public restricted {
        last_Completed_Migration = completed;
    }

    function upgrade(address new_address) public restricted {
        Migrations upgraded = Migrations(new_address);
        upgraded.setCompleted(last_Completed_Migration);
    }
}

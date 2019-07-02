pragma solidity 0.5.10;

contract Owned {
    address public owner;
    
    modifier _onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    constructor() public {
        owner = msg.sender;
    }
}
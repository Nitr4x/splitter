pragma solidity 0.5.10;

contract Owned {
    
    address public owner;
    
    event LogOwnerChanged(address newOwner);
    
    modifier _onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    constructor() public {
        owner = msg.sender;
    }
    
    function changeOwner(address newOwner) internal _onlyOwner returns(bool) {
        owner = newOwner;
        
        emit LogOwnerChanged(newOwner);
        
        return true;
    }
}
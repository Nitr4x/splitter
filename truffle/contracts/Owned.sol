pragma solidity 0.5.10;

contract Owned {
    
    address private owner;
    
    event LogOwnerChanged(address indexed newOwner);
    
    modifier _onlyOwner {
        require(msg.sender == owner);
        _;
    }
    
    constructor() public {
        owner = msg.sender;
    }
    
    function changeOwner(address newOwner) public _onlyOwner returns(bool) {
        require(newOwner != address(0));
        
        owner = newOwner;
        
        emit LogOwnerChanged(newOwner);
        
        return true;
    }
    
    function getOwner() public view returns(address) {
        return owner;
    }
}
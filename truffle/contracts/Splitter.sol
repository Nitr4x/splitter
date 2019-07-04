pragma solidity 0.5.10;

import './Stoppable.sol';

contract Splitter is Stoppable {
    
    struct Account {
        uint    pendingWithdrawals;
    }
    
    mapping(address => Account) accountStorage;

    event LogEthSent(address sender, uint value, address receiver1, address receiver2);
    event LogWithdrawed(address sender, uint amount);
    
    constructor() public payable {}
    
    function splitEth(address receiver1, address receiver2) public _onlyIfRunning payable returns(bool) {
        require(msg.value <= msg.sender.balance, 'The sender balance shoud be higher the ether\'s value');

        accountStorage[receiver1].pendingWithdrawals += msg.value / 2;
        accountStorage[receiver2].pendingWithdrawals += msg.value / 2;

        emit LogEthSent(msg.sender, msg.value, receiver1, receiver2);
        
        return true;
    }
    
    function withdraw() public returns(bool) {
        uint amount = accountStorage[msg.sender].pendingWithdrawals;
        
        accountStorage[msg.sender].pendingWithdrawals = 0;
        
        emit LogWithdrawed(msg.sender, amount);

        msg.sender.transfer(amount);
        
        return true;
    }
}
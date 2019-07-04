pragma solidity 0.5.10;

import './Stoppable.sol';

contract Splitter is Stoppable {
    
    struct Account {
        uint    pendingWithdrawals;
    }
    
    mapping(address => Account) accountStorage;

    event LogEthSent(address sender, uint amount);
    event LogWithdrawed(address receiver);
    
    constructor() public payable {}
    
    function splitEth(address receiver1, address receiver2) public _onlyIfRunning payable returns(bool) {
        require(msg.value <= msg.sender.balance);

        accountStorage[receiver1].pendingWithdrawals += msg.value / 2;
        accountStorage[receiver2].pendingWithdrawals += msg.value / 2;

        emit LogEthSent(msg.sender, msg.value);
        
        return true;
    }
    
    function getBalance() public view returns(uint256) {
        return address(this).balance;    
    }
    
    function withdraw() public _onlyIfRunning returns(bool) {
        uint amount = accountStorage[msg.sender].pendingWithdrawals;
        
        accountStorage[msg.sender].pendingWithdrawals = 0;
        msg.sender.transfer(amount);
        
        emit LogWithdrawed(msg.sender);
        
        return true;
    }
}
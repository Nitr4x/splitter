pragma solidity 0.5.10;

import './SafeMath.sol';
import './Stoppable.sol';

contract Splitter is Stoppable {
    using SafeMath for uint;

    mapping(address => uint) balances;

    event LogEthSent(address sender, uint value, address receiver1, address receiver2);
    event LogWithdrawed(address sender, uint amount);

    constructor() public payable {}
    
    function splitEth(address receiver1, address receiver2) public _onlyIfRunning payable returns(bool) {
        uint half = msg.value / 2;

        if (msg.value % 2 > 0) {
            balances[msg.sender] = balances[msg.sender].add(1);
        }
        
        balances[receiver1] = balances[receiver1].add(half);
        balances[receiver2] = balances[receiver2].add(half);

        emit LogEthSent(msg.sender, msg.value, receiver1, receiver2);
        
        return true;
    }
    
    function withdraw() public returns(bool) {
        require(balances[msg.sender] > 0);

        uint amount = balances[msg.sender];
        
        balances[msg.sender] = 0;
        
        emit LogWithdrawed(msg.sender, amount);

        msg.sender.transfer(amount);
        
        return true;
    }
}
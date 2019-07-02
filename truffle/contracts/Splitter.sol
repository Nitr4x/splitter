pragma solidity 0.5.10;

import './Owned.sol';

contract Splitter is Owned {
    struct Person {
        address wallet;
        bytes32 name;
        uint pendingWithdrawals;
        bool isParticipant;
    }
    
    mapping(address => Person) participantStorage;
    address[] participantList;

    constructor() public payable {}
    
    function isParticipant(address participant) internal view returns(bool) {
        return participantStorage[participant].isParticipant;    
    }
    
    function addParticipant(address participant, bytes32 name) public _onlyOwner returns(bool) {
        require(!isParticipant(participant));
        
        participantList.push(participant);
        participantStorage[participant].wallet = participant;
        participantStorage[participant].name = name;
        participantStorage[participant].pendingWithdrawals = 0;
        participantStorage[participant].isParticipant = true;
        
        return true;
    }
    
    function getParticipants() public view returns(address[] memory, bytes32[] memory) {
        address[] memory addrs = new address[](participantList.length);
        bytes32[] memory names = new bytes32[](participantList.length);
        
        for (uint i = 0; i < participantList.length; i++) {
            addrs[i] = participantStorage[participantList[i]].wallet;
            names[i] = participantStorage[participantList[i]].name;
        }
        
        return (addrs, names);
    }
    
    function sendWei() public payable returns(bool) {
        require(isParticipant(msg.sender));
        require(msg.value <= msg.sender.balance);
        require(participantList.length > 0);

        for (uint i = 0; i < participantList.length; i++) {
            if (participantList[i] != msg.sender) {
                participantStorage[participantList[i]].pendingWithdrawals += msg.value / (participantList.length - 1);
            }
        }
        
        return true;
    }
    
    function withdraw() public returns(bool) {
        require(isParticipant(msg.sender));
        
        uint amount = participantStorage[msg.sender].pendingWithdrawals;
        
        participantStorage[msg.sender].pendingWithdrawals = 0;
        msg.sender.transfer(amount);
        
        return true;
    }
}
pragma solidity 0.5.10;

import './Owned.sol';

contract Splitter is Owned {
    
    struct Person {
        address wallet;
        bytes32 name;
        uint    pendingWithdrawals;
        uint    index;
        bool    isParticipant;
    }
    
    mapping(address => Person) participantStorage;
    address[] participantList;
    uint public balance;

    event LogParticipantAdded(address participant, bytes32 name);
    event LogPariticipantDeleted(address participant);
    event LogEthSent(address sender, uint amount);
    event LogWithdrawed(address receiver);
    
    modifier _onlyParticipant {
        require(participantStorage[msg.sender].isParticipant);
        _;
    }
    
    constructor(bytes32 name) public payable {
        balance = 0;
        addParticipant(msg.sender, name);
    }
    
    function addParticipant(address participant, bytes32 name) public _onlyOwner returns(bool) {
        require(!participantStorage[participant].isParticipant);
        
        participantStorage[participant].wallet = participant;
        participantStorage[participant].name = name;
        participantStorage[participant].pendingWithdrawals = 0;
        participantStorage[participant].index = participantList.length;
        participantStorage[participant].isParticipant = true;
        participantList.push(participant);

        emit LogParticipantAdded(participant, name);
        
        return true;
    }
    
    function deleteParticipant(address participant) public _onlyParticipant returns(bool) {
        require(msg.sender == participant && msg.sender != owner);
        
        uint index = participantStorage[msg.sender].index;
        
        participantList[index] = participantList[participantList.length - 1];
        participantStorage[participantList[participantList.length - 1]].index = index;
        participantList.length--;

        delete(participantStorage[msg.sender]);
        
        emit LogPariticipantDeleted(msg.sender);
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
    
    function sendEth() public _onlyParticipant payable returns(bool) {
        require(msg.value <= msg.sender.balance);
        require(participantList.length > 1);

        balance += msg.value;
        for (uint i = 0; i < participantList.length; i++) {
            if (participantList[i] != msg.sender) {
                participantStorage[participantList[i]].pendingWithdrawals += msg.value / (participantList.length - 1);
            }
        }
        
        emit LogEthSent(msg.sender, msg.value);
        
        return true;
    }
    
    function changeOwnernership(address newOwner) public _onlyParticipant _onlyOwner returns(bool) {
        return super.changeOwner(newOwner);    
    }
    
    function withdraw() public _onlyParticipant returns(bool) {
        uint amount = participantStorage[msg.sender].pendingWithdrawals;
        
        participantStorage[msg.sender].pendingWithdrawals = 0;
        balance -= amount;
        msg.sender.transfer(amount);
        
        emit LogWithdrawed(msg.sender);
        
        return true;
    }
}
'use strict';

const Splitter = artifacts.require('Splitter');
const truffleAssert = require('truffle-assertions');

contract('Splitter', (accounts) => {
    //Testing the balance update
    it('Balance should be equal to 10 ether', () => {
        let instance;
        
        return Splitter.new()
            .then(_instance => {
                instance = _instance;
                return instance.splitEth(accounts[1], accounts[2], {from: accounts[0], value: web3.utils.toWei("10", "ether")});
            })
            .then(txObj => {
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, "LogEthSent");
                return web3.eth.getBalance(instance.address);
            })
            .then(balance => {
                assert.strictEqual(balance, web3.utils.toWei("10", "ether"));
            });
    });

    // Testing to split ether if the contract has been paused
    it('The splitEth function should not be usable when the contract is paused', () => {
        let instance;

        return Splitter.new()
            .then(_instance => {
                instance = _instance;
                return instance.pauseContract();
            })
            .then(async txObj => {
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, "LogPausedContract");

                await truffleAssert.reverts(
                    instance.splitEth(accounts[1], accounts[2], {from: accounts[0], value: web3.utils.toWei("10", "ether")})
                );
            });
    });

    // Testing the withdraw function with empty balance
    it('Withdraw should fail on empty balance', () => {
        return Splitter.new()
            .then(async instance => {
                await truffleAssert.reverts(
                    instance.withdraw({from: accounts[1]})
                );
            });
    });

    // Checking the final balance with even number
    it('Balances should be emptied on even number', () => {
        let instance;

        return Splitter.new()
            .then(_instance => {
                instance = _instance;
                return instance.splitEth(accounts[1], accounts[2], {from: accounts[0], value: web3.utils.toWei("10", "ether")});
            })
            .then(async txObj => {
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, "LogEthSent");

                await instance.withdraw({from: accounts[1]});
                await instance.withdraw({from: accounts[2]});
                return web3.eth.getBalance(instance.address);
            })
            .then(balance => {
                assert.strictEqual(balance, web3.utils.toWei("0", "ether"));
            });
    });

    // Checking the final balance with odd number
    it('Balances should be emptied on odd number when the original sender withdrawed as well', () => {
        let instance;

        return Splitter.new()
            .then(_instance => {
                instance = _instance;
                return instance.splitEth(accounts[1], accounts[2], {from: accounts[0], value: 3});
            })
            .then(async txObj => {
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, "LogEthSent");

                await instance.withdraw({from: accounts[1]});
                await instance.withdraw({from: accounts[2]});
                return web3.eth.getBalance(instance.address);
            })
            .then(async balance => {
                assert.strictEqual(balance, '1');
                await instance.withdraw({from: accounts[0]});
                return web3.eth.getBalance(instance.address);
            })
            .then(balance => {
                assert.strictEqual(balance, '0');
            });
    });
});
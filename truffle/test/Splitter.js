'use strict';

const Splitter = artifacts.require('Splitter');
const truffleAssert = require('truffle-assertions');
const {BN, toWei, fromWei} = web3.utils

contract('Splitter', (accounts) => {
    let instance;

    // Initiating new contract before each test
    beforeEach("Creating new contract", async () => {
        instance = await Splitter.new({from: accounts[0]});
    });

    //Testing the balance update
    it('Balance should be equal to 1 ether', () => {
        return instance.splitEth(accounts[1], accounts[2], {from: accounts[0], value: toWei("1", "ether")})
            .then(txObj => {
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, "LogEthSent");
                assert.isTrue(txObj.receipt.status);

                return web3.eth.getBalance(instance.address);
            })
            .then(balance => {
                assert.strictEqual(balance, toWei("1", "ether"));
            });
    });

    // Testing to split ether if the contract has been paused
    it('The splitEth function should not be usable when the contract is paused', async () => {
        const txObj = await instance.pauseContract({from: accounts[0]});
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogPausedContract");
        assert.isTrue(txObj.receipt.status);

        await truffleAssert.reverts(
            instance.splitEth(accounts[1], accounts[2], {from: accounts[0], value: toWei("10", "ether")})
        );
    });

    // Testing the withdraw function with empty balance
    it('Withdraw should fail on empty balance', async () => {
        await truffleAssert.reverts(
            instance.withdraw({from: accounts[1]})
        );
    });

    // Checking the final balance with even number
    it('Balances should be emptied on even number', async () => {
        let txObj = await instance.splitEth(accounts[1], accounts[2], {from: accounts[0], value: toWei("3", "ether")})
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogEthSent");

        // Withdrawing and checking account[1] balance
        txObj = await instance.withdraw({from: accounts[1]});
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogWithdrawed");
        assert.strictEqual(txObj.logs[0].args[0], accounts[1]);
        assert.strictEqual(fromWei(txObj.logs[0].args[1], "ether"), '1.5');
        assert.isTrue(txObj.receipt.status);

        // Withdrawing and checking account[2] balance
        txObj = await instance.withdraw({from: accounts[2]});
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogWithdrawed");
        assert.strictEqual(txObj.logs[0].args[0], accounts[2]);
        assert.strictEqual(fromWei(txObj.logs[0].args[1], "ether"), '1.5');
        assert.isTrue(txObj.receipt.status);

        return web3.eth.getBalance(instance.address)
            .then(balance => {
                assert.strictEqual(balance, toWei("0", "ether"));
            });
    });

    // Checking the final balance with odd number
    it('Balances should be emptied on odd number when the original sender withdrawed as well', () => {
        return instance.splitEth(accounts[1], accounts[2], {from: accounts[0], value: 3})
            .then(async txObj => {
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, "LogEthSent");
                assert.isTrue(txObj.receipt.status);

                txObj = await instance.withdraw({from: accounts[1]});
                assert.strictEqual(txObj.logs[0].args[0], accounts[1]);
                assert.strictEqual(txObj.logs[0].args[1].toString(), '1');
                assert.isTrue(txObj.receipt.status);
                assert.isTrue(txObj.receipt.status);

                txObj = await instance.withdraw({from: accounts[2]});
                assert.strictEqual(txObj.logs[0].args[0], accounts[2]);
                assert.strictEqual(txObj.logs[0].args[1].toString(), '1');
                assert.isTrue(txObj.receipt.status);

                return web3.eth.getBalance(instance.address);
            })
            .then(async balance => {
                assert.strictEqual(balance, '1');

                const txObj = await instance.withdraw({from: accounts[0]});
                assert.strictEqual(txObj.logs[0].args[0], accounts[0]);
                assert.strictEqual(txObj.logs[0].args[1].toString(), '1');
                assert.isTrue(txObj.receipt.status);

                return web3.eth.getBalance(instance.address);
            })
            .then(balance => {
                assert.strictEqual(balance, '0');
            });
    });
});
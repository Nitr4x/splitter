'use strict';

const Splitter = artifacts.require('Splitter');
const truffleAssert = require('truffle-assertions');
const BN = require('big-number');

const {toWei} = web3.utils;
const {getBalance} = web3.eth;

contract('Splitter', (accounts) => {
    const alice = accounts[0];
    const bob = accounts[1];
    const carol = accounts[2];

    let instance;

    beforeEach("Creating new contract", async () => {
        instance = await Splitter.new(true, {from: alice});
    });

    it('Should increase the contract\'s balance and deplete alice\'s balance of 0.1 ether', async () => {
        let aliceBalance = new BN(await getBalance(alice));

        const txObj = await instance.splitEth(bob, carol, {from: alice, value: toWei("0.1", "ether")});
        const gasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;

        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogEthSent");
        assert.isTrue(txObj.receipt.status);

        aliceBalance.minus(txObj.receipt.gasUsed * gasPrice);
        aliceBalance.minus(toWei("0.1", "ether"));

        assert.strictEqual(await getBalance(instance.address), toWei("0.1", "ether"));
        assert.strictEqual(await getBalance(alice), aliceBalance.toString());
    });

    it('Should fail to split ether if the contract is paused', async () => {
        const txObj = await instance.pauseContract({from: alice});
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogPausedContract");
        assert.isTrue(txObj.receipt.status);

        await truffleAssert.reverts(
            instance.splitEth(bob, carol, {from: alice, value: toWei("0.1", "ether")})
        );
    });

    it('Should fail to withdraw on empty balance', async () => {
        await truffleAssert.reverts(
            instance.withdraw({from: alice})
        );
    });

    it('Should withdrawed bob and calor balances and the contract\'s balance should be emptied', async () => {
        let bobBalance = new BN(await getBalance(bob));
        let carolBalance = new BN(await getBalance(carol));

        let txObj = await instance.splitEth(bob, carol, {from: alice, value: toWei("3", "ether")})
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogEthSent");
        assert.strictEqual(txObj.logs[0].args[0], alice);
        assert.strictEqual(txObj.logs[0].args[1].toString(), toWei("3", "ether"));
        assert.strictEqual(txObj.logs[0].args[2], bob);
        assert.strictEqual(txObj.logs[0].args[3], carol);

        // Withdrawing and checking bob's balance
        txObj = await instance.withdraw({from: bob});
        let gasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogWithdrawed");
        assert.strictEqual(txObj.logs[0].args[0], bob);
        assert.strictEqual(txObj.logs[0].args[1].toString(), toWei("1.5", "ether"));
        assert.isTrue(txObj.receipt.status);

        bobBalance.minus(txObj.receipt.gasUsed * gasPrice);
        bobBalance.add(toWei("1.5", "ether"));
        assert.strictEqual(await getBalance(bob), bobBalance.toString());

        // Withdrawing and checking carol's balance
        txObj = await instance.withdraw({from: carol});
        gasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogWithdrawed");
        assert.strictEqual(txObj.logs[0].args[0], carol);
        assert.strictEqual(txObj.logs[0].args[1].toString(), toWei("1.5", "ether"));
        assert.isTrue(txObj.receipt.status);

        carolBalance.minus(txObj.receipt.gasUsed * gasPrice);
        carolBalance.add(toWei("1.5", "ether"));
        assert.strictEqual(await getBalance(carol), carolBalance.toString());

        assert.strictEqual(await getBalance(instance.address), "0");
    });

    it('Should withdrawed both bob and carol balances as well as the remaining to alice', async () => {
        let bobBalance = new BN(await getBalance(bob));
        let carolBalance = new BN(await getBalance(carol));
        let aliceBalance = new BN(await getBalance(alice));

        let txObj = await instance.splitEth(bob, carol, {from: alice, value: 3});
        let gasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogEthSent");
        assert.isTrue(txObj.receipt.status);
        assert.strictEqual(txObj.logs[0].args[0], alice);
        assert.strictEqual(txObj.logs[0].args[1].toString(), "3");
        assert.strictEqual(txObj.logs[0].args[2], bob);
        assert.strictEqual(txObj.logs[0].args[3], carol);

        aliceBalance.minus(txObj.receipt.gasUsed * gasPrice);
        aliceBalance.minus("3");
        assert.strictEqual(await getBalance(alice), aliceBalance.toString());

        assert.strictEqual(await getBalance(instance.address), "3");

        // Bob withdrawing
        txObj = await instance.withdraw({from: bob});
        gasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogWithdrawed");
        assert.strictEqual(txObj.logs[0].args[0], bob);
        assert.strictEqual(txObj.logs[0].args[1].toString(), "1");
        assert.isTrue(txObj.receipt.status);

        bobBalance.minus(txObj.receipt.gasUsed * gasPrice);
        bobBalance.add("1");
        assert.strictEqual(await getBalance(bob), bobBalance.toString());

        assert.strictEqual(await getBalance(instance.address), "2");

        // Carol withdrawing
        txObj = await instance.withdraw({from: carol});
        gasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogWithdrawed");
        assert.strictEqual(txObj.logs[0].args[0], carol);
        assert.strictEqual(txObj.logs[0].args[1].toString(), "1");
        assert.isTrue(txObj.receipt.status);

        carolBalance.minus(txObj.receipt.gasUsed * gasPrice);
        carolBalance.add("1");
        assert.strictEqual(await getBalance(carol), carolBalance.toString());

        assert.strictEqual(await getBalance(instance.address), "1");

        // Alice withdrawing
        txObj = await instance.withdraw({from: alice});
        gasPrice = (await web3.eth.getTransaction(txObj.tx)).gasPrice;
        assert.strictEqual(txObj.logs.length, 1);
        assert.strictEqual(txObj.logs[0].event, "LogWithdrawed");
        assert.strictEqual(txObj.logs[0].args[0], alice);
        assert.strictEqual(txObj.logs[0].args[1].toString(), "1");
        assert.isTrue(txObj.receipt.status);

        aliceBalance.minus(txObj.receipt.gasUsed * gasPrice);
        aliceBalance.add("1");
        assert.strictEqual(await getBalance(alice), aliceBalance.toString());

        assert.strictEqual(await getBalance(instance.address), "0");
    });
});
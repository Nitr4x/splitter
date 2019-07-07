'use strict';

const Stoppable = artifacts.require('Stoppable');
const truffleAssert = require('truffle-assertions');

contract('Stoppable', (accounts) => {
    // Testing that the function resumeContract is reverted if the contract is already running.
    it('The contract is already running. resumeContract function should fail', () => {
        return Stoppable.new()
            .then(async instance => {
                await truffleAssert.reverts(
                    instance.resumeContract()
                );                  
            });
    });

    // Testing that the function pauseContract is reverted if the contract is already paused.
    it('The contract is already paused. pauseContract function should fail', () => {
        let instance;

        return Stoppable.new()
            .then(_instance => {
                instance = _instance;
                return instance.pauseContract();
            })
            .then(async (txObj) => {
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, "LogPausedContract");

                await truffleAssert.reverts(
                    instance.pauseContract() 
                );
            })
    });

    // Testing that only the owner is able to pause the contract.
    it('Only the owner should be able to pause the contract', () => {
        return Stoppable.new()
            .then(async instance => {
                await truffleAssert.reverts(
                    instance.pauseContract({from: accounts[1]})
                );
            });
    });

    // Testing that only the owner is able to resume the contract when paused.
    it('Only the owner should be able to resume the contract', () => {
        let instance;

        return Stoppable.new()
            .then(_instance => {
                instance = _instance;
                return instance.pauseContract()
            })
            .then(async (txObj) => {
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, "LogPausedContract");
                
                await truffleAssert.reverts(
                    instance.resumeContract({from: accounts[1]})
                );
            });
    });

    // Testing the full chain
    it('Pausing and resuming the contract', () => {
        let instance;

        return Stoppable.new()
            .then(_instance => {
                instance = _instance;
                return instance.pauseContract();
            })
            .then(txObj => {
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, "LogPausedContract");
                
                return instance.resumeContract();
            })
            .then(txObj => {
                assert.strictEqual(txObj.logs.length, 1);
                assert.strictEqual(txObj.logs[0].event, "LogResumeContract");
            });
    })
});
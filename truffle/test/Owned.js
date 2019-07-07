'use strict';

const Owned = artifacts.require('Owned');
const truffleAssert = require('truffle-assertions');

contract('Owned', (accounts) => {
    let instance;

    // Initiating new contract before each test
    beforeEach("Creating new contract", async () => {
        await Owned.new()
            .then(_instance => {
                instance = _instance;
            });
    });

    // Testing getOwner function.
    it('Owner should be ' + accounts[0], () => {
        return instance.getOwner()
            .then(owner => {
                assert.strictEqual(owner, accounts[0]);
            });
    });

    // Testing changeOwner function.
    it('Owner should be ' + accounts[1], () => {
        return instance.changeOwner(accounts[1])
            .then(() => {
                return instance.getOwner();
            })
            .then(owner => {
                assert.strictEqual(owner, accounts[1]);
            });
    });

    // Testing the _onlyOwner modifier.
    it('Changing owner from unauthorized account. changeOwner function should fail', async () => {
        return await truffleAssert.reverts(
            instance.changeOwner(accounts[1], {from: accounts[1]})
        );               
    });
});
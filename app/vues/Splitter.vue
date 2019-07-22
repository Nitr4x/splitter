<template>
    <div class="container">
        <div class="row">
            <div class="column">
                <h1>Welcome to Splitter</h1>
            </div>
            <div v-if='this.participants["first"].name == "" || this.participants["first"].wallet == ""
                    || this.participants["second"].name == "" || this.participants["second"].wallet == ""
                    || this.participants["third"].name == "" || this.participants["third"].wallet == ""' id="settings">
                <h3>Setup</h3>
                <form v-on:submit.prevent="save">
                    Participants:</br>
                    <input placeholder="name" v-model="participants['first'].name"/><input placeholder="Wallet address" v-model="participants['first'].wallet"/></br>
                    <input placeholder="name" v-model="participants['second'].name"/><input placeholder="Wallet address" v-model="participants['second'].wallet"/></br>
                    <input placeholder="name" v-model="participants['third'].name"/><input placeholder="Wallet address" v-model="participants['third'].wallet"/></br>
                </form>
            </div>
            <div v-if='this.participants["first"].name != "" && this.participants["first"].wallet != ""
                    && this.participants["second"].name != "" && this.participants["second"].wallet != ""
                    && this.participants["third"].name != "" && this.participants["third"].wallet != ""'>
                <div>
                    <h3>Split ether</h3>
                    From:
                    <select v-model="tx.from">
                        <option v-bind:value='participants["first"].wallet'>{{participants["first"].name}}</option>
                        <option v-bind:value='participants["second"].wallet'>{{participants["second"].name}}</option>
                        <option v-bind:value='participants["third"].wallet'>{{participants["third"].name}}</option>
                    </select>
                    To:
                    <select v-model="tx.to_1">
                        <option v-bind:value='participants["first"].wallet'>{{participants["first"].name}}</option>
                        <option v-bind:value='participants["second"].wallet'>{{participants["second"].name}}</option>
                        <option v-bind:value='participants["third"].wallet'>{{participants["third"].name}}</option>
                    </select>
                    To:
                    <select v-model="tx.to_2">
                        <option v-bind:value='participants["first"].wallet'>{{participants["first"].name}}</option>
                        <option v-bind:value='participants["second"].wallet'>{{participants["second"].name}}</option>
                        <option v-bind:value='participants["third"].wallet'>{{participants["third"].name}}</option>
                    </select>
                    Amount:
                    <input v-model="tx.amount" placeholder="amount"/>
                    <button @click="send">Send</button>
                </div>
                <div>
                    <h3>Balances</h3>
                    <p>Contract: {{contract.balance}}</p>
                    <p>{{participants["first"].name}}: {{participants["first"].balance}} <button @click='withdraw(participants["first"].wallet)'>withdraw</button></p>
                    <p>{{participants["second"].name}}: {{participants["second"].balance}} <button @click='withdraw(participants["second"].wallet)'>withdraw</button></p>
                    <p>{{participants["third"].name}}: {{participants["third"].balance}} <button @click='withdraw(participants["third"].wallet)'>withdraw</button></p>        
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import contract from 'truffle-contract';
    import Web3 from 'web3';

    export default {
        name: "Splitter",
        data() {
            return {
                contract: {
                    entrypoint: null,
                    balance: "0"
                },
                participants: {
                    "first": {
                        name: "",
                        wallet: "",
                        balance: "0"
                    },
                    "second": {
                        name: "",
                        wallet: "",
                        balance: "0"
                    },
                    "third": {
                        name: "",
                        wallet: "",
                        balance: "0"
                    }
                },
                tx: {
                    from: "",
                    to_1: "",
                    to_2: "",
                    amount: "0"
                }
            }
        },
        methods: {
            send: async function() {
                const txObj = await this.contract.entrypoint.splitEth(this.tx.to_1, this.tx.to_2, {from: this.tx.from, value: web3.utils.toWei(this.tx.amount, "ether")});
                (txObj.logs.length === 1 && txObj.logs[0].event === "LogEthSent") ? alert("Transfer successful") : alert("Transfer unsuccessful");
                this.update();
                this.clear();
            },
            update: async function() {
                this.contract.balance = web3.utils.fromWei(await web3.eth.getBalance(this.contract.entrypoint.address), "ether");
                this.participants["first"].balance = web3.utils.fromWei(await this.contract.entrypoint.balances.call(this.participants["first"].wallet), "ether");
                this.participants["second"].balance = web3.utils.fromWei(await this.contract.entrypoint.balances.call(this.participants["second"].wallet), "ether");
                this.participants["third"].balance = web3.utils.fromWei(await this.contract.entrypoint.balances.call(this.participants["third"].wallet), "ether");
            },
            clear: function() {
                this.tx.from = "";
                this.tx.to_1 = "";
                this.tx.to_2 = "";
                this.tx.amount = 0;
            },
            withdraw: async function(wallet) {
                const txObj = await this.contract.entrypoint.withdraw({from: wallet});
                (txObj.logs.length === 1 && txObj.logs[0].event === "LogWithdrawed") ? alert("Account withdrawed") : alert("An error occured. Retry later");
                this.update();
            }
        },
        async mounted() {
            const splitterJson = require("../../build/contracts/Splitter.json");
            if (typeof web3 !== 'undefined') {
                win
                dow.web3 = new Web3(web3.currentProvider);
            } else {
                window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
            }

            let splitterContract = contract(splitterJson);
            splitterContract.setProvider(web3.currentProvider);
            
            this.contract.entrypoint = await splitterContract.deployed();
            this.update();
        }
    }
</script>
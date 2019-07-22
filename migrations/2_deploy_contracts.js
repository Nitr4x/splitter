const Math = artifacts.require("./SafeMath");
const Splitter = artifacts.require("./Splitter");

module.exports = async function (deployer) {
    await deployer.deploy(Math);
    await deployer.link(Math, Splitter);
    await deployer.deploy(Splitter, true);
};

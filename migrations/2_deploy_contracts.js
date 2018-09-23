var Auction = artifacts.require("Auction");

module.exports = function (deployer) {
    deployer.deploy(Auction, 17, 5);
    // To pass arguments, separate by comma
};
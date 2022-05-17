// First we have to import the artifacts
var MyToken = artifacts.require("MyToken");
var MyTokenSale = artifacts.require("MyTokenSale");
var KycContract = artifacts.require("KycContract");

require("dotenv").config({path: "../.env"});

// deployer is the handle to get access to the blockchain
module.exports = async function(deployer) {
    let addr = await web3.eth.getAccounts();
    // You have to tell what you want to deploy
    await deployer.deploy(MyToken, process.env.INITIAL_TOKENS);
    await deployer.deploy(KycContract);
    // 1 wei is 1 token
    await deployer.deploy(MyTokenSale, 1, addr[0], MyToken.address, KycContract.address);

    let instance = await MyToken.deployed();
    // Transfer the whole amount such as the SC holds all the tokens
    await instance.transfer(MyTokenSale.address, process.env.INITIAL_TOKENS);
}
// Web3 is automatically injected in Truffle test
const TokenSale = artifacts.require("MyTokenSale");
const Token = artifacts.require("MyToken");
const KycContract = artifacts.require("KycContract");

require("dotenv").config({path: "../.env"});
const chai = require("./setupchai.js");
const BN = web3.utils.BN;
const expect = chai.expect;

contract("TokenSale Test", async (accounts) => 
{
    const [deployerAccount, recipient, anotherAccount] = accounts;

    // I do not copy the beforeEach too since we use the SC deployed in the migration file

    it("should not have any tokens in my deployerAccount", async () => {
        let instance = await Token.deployed();
        return await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN(0));
    });

    it("all coins should be in the tokensale smart contract", async () => {
        let instance = await Token.deployed();
        let balance = await instance.balanceOf.call(TokenSale.address);
        let totalSupply = await instance.totalSupply.call();
        return expect(balance).to.be.a.bignumber.equal(totalSupply);
    });
    
    it("should be possible to buy one token by simply sending ether to the smart contract", async () => {
        let tokenInstance = await Token.deployed();
        let tokenSaleInstance = await TokenSale.deployed();
        let balanceBeforeAccount = await tokenInstance.balanceOf.call(recipient);
        await expect(tokenSaleInstance.sendTransaction({from: recipient, value: web3.utils.toWei("1", "wei")})).to.be.rejected;
        await expect(balanceBeforeAccount).to.be.bignumber.equal(await tokenInstance.balanceOf.call(recipient));
    
        let kycInstance = await KycContract.deployed();
        await kycInstance.setKycCompleted(recipient);
        await expect(tokenSaleInstance.sendTransaction({from: recipient, value: web3.utils.toWei("1", "wei")})).to.be.fulfilled;
        return expect(balanceBeforeAccount + 1).to.be.bignumber.equal(await tokenInstance.balanceOf.call(recipient));
    });
});
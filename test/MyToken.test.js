// Referenced from https://github.com/OpenZeppelin/openzeppelin-test-helpers/blob/master/src/setup.js,
// used in https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/test/token/ERC20/ERC20.test.js

// Web3 is automatically injected in Truffle test
const Token = artifacts.require("MyToken");

require("dotenv").config({path: "../.env"});
const chai = require("./setupchai.js");
// BN -> Big Number
const BN = web3.utils.BN;
const expect = chai.expect;

contract("Token Test", async (accounts) => 
{
    // So, deployerAccount is now the accounts[0], recipient is accounts[1] etc.
    const [deployerAccount, recipient, anotherAccount] = accounts;

    // Hook function, it hooks before each test suite
    beforeEach(async () => {
        // It is directly deployed in our test case
        this.myToken = await Token.new(process.env.INITIAL_TOKENS);
    });

    // This function takes as second param a callback function
    it("all tokens should be in my account", async () => {
        // Here we define our test case
        // In that way we take our token instance once deployed
        let instance = this.myToken;
        let totalSupply = await instance.totalSupply();

        // console.log("weiRaised: ", await instanceSale.weiRaised());
        // console.log("wallet: ", await instanceSale.wallet());
        // console.log("token: ", await instanceSale.token());
        // console.log("totalSupply: ", totalSupply);

        // In the old version, would be
        // accounts[0] is the account who deployed the contract
        /* let balance = await instance.balanceOf(accounts[0]);
        assert.equal(balance.valueOf(), initialSupply.valueOf(), "The balance was not the same"); */

        // Better to use expect, from chai.expect
        // we use await since it is a promise to be resolved
        /* expect(await instance.balanceOf(accounts[0])).to.be.a.bignumber.equal(totalSupply); */

        // With chai-as-promised, we can do in the following way
        // https://www.chaijs.com/plugins/chai-as-promised/
        // The "eventually" takes care of waiting for this promised to resolve
        return await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply)
    });

    it("is not possible to send more tokens than available in total", async () => {
        
        let instance = this.myToken;
        let balanceOfDeployer = await instance.balanceOf(deployerAccount);

        await expect(instance.transfer(recipient, new BN(balanceOfDeployer+1))).to.eventually.be.rejected;
        return await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(new BN(balanceOfDeployer));
    });

    it("is possible to send tokens between accounts", async () => {
        const sendTokens = 1;
        let instance = this.myToken;
        let totalSupply = await instance.totalSupply();

        await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply);
        // fulfilled or rejected, no more need of try and catch
        await expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(0));
        await expect(instance.transfer(recipient, sendTokens)).to.eventually.be.fulfilled;
        await expect(instance.balanceOf(deployerAccount)).to.eventually.be.a.bignumber.equal(totalSupply.sub(new BN(sendTokens)));
        return await expect(instance.balanceOf(recipient)).to.eventually.be.a.bignumber.equal(new BN(sendTokens));
    });
});
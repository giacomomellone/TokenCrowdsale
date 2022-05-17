import React, { Component } from "react";
import MyToken from "./contracts/MyToken.json";
import MyTokenSale from "./contracts/MyTokenSale.json";
import KycContract from "./contracts/KycContract.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  // We have to understand if our app is loaded or not
  state = { loaded:false, kycAddress:"0x123..", tokenSaleAddress: null, userTokens:0 };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      // Using this. I am making everything a state variable
      this.web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      this.accounts = await this.web3.eth.getAccounts();

      // Get the contract instance.
      this.networkId = await this.web3.eth.net.getId();

      this.tokenInstance = new this.web3.eth.Contract(
        MyToken.abi,
        MyToken.networks[this.networkId] && MyToken.networks[this.networkId].address,
      );

      this.tokenSaleInstance = new this.web3.eth.Contract(
        MyTokenSale.abi,
        MyTokenSale.networks[this.networkId] && MyTokenSale.networks[this.networkId].address,
      );

      this.kycContract = new this.web3.eth.Contract(
        KycContract.abi,
        KycContract.networks[this.networkId] && KycContract.networks[this.networkId].address,
      );

      this.listenToTokenTransfer();
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({loaded:true, tokenSaleAddress:MyTokenSale.networks[this.networkId].address}, this.updateUserTokens);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  updateUserTokens = async() => {
    let userTokens = await this.tokenInstance.methods.balanceOf(this.accounts[0]).call();
    this.setState({userTokens: userTokens});
  }

  // To update the amount once the Token are exchanged
  listenToTokenTransfer = () => {
    // We are filtering, only when the address is set to this account 
    this.tokenInstance.events.Transfer({to: this.accounts[0]}).on("data", this.updateUserTokens);
  }

  handleBuyTokens = async() => {
    await this.tokenSaleInstance.methods.buyTokens(this.accounts[0]).send({from: this.accounts[0], value: this.web3.utils.toWei("1", "wei")});
  }

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;
    this.setState({
      [name]: value
    });
  }

  handleKycSubmit = async () => {
    const {kycAddress} = this.state;
    // send() -> alter the state of the contract
    // call() -> do not alter the state of the contract
    await this.kycContract.methods.setKycCompleted(kycAddress).send({from: this.accounts[0]});
    alert("Account "+kycAddress+" is now whitelisted");
  }

  getOwner = async () => {
    const {kycAddress} = this.state;
    const owner = await this.kycContract.methods.owner().call();
    alert("Owner account "+owner);
  }

  render() {
    if (!this.state.loaded) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Capuccino Token for StarDucks</h1>

        <h2>Enable your account</h2>
        Address to allow: <input type="text" name="kycAddress" value={this.state.kycAddress} onChange={this.handleInputChange} /> 
        <button type="button" onClick={this.handleKycSubmit}>Add Address to Whitelist</button>
        <h3><button type="button" onClick={this.getOwner}>Return Owner</button></h3>
        <h2>Buy Tokens</h2>
        <p>If you want to buy Tokens, send Wei to this address: {this.state.tokenSaleAddress}</p>
        <p>You currently have: {this.state.userTokens} CAPPU Tokens</p>
        <button type="button" onClick={this.handleBuyTokens}>Buy more Tokens</button>
      </div>
    );
  }
}

export default App;

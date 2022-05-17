// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Crowdsale.sol";
import "./KycContract.sol";

// The idea here is that the TokenSale Smart Contract is holding the token, and when
// someone sends money to him, the Tokens are sent back to the person who's sending money
contract MyTokenSale is Crowdsale {

    KycContract kyc;

    constructor(
        uint256 rate,    // rate in TKNbits
        address payable wallet,
        IERC20 token,
        KycContract _kyc
    )
        Crowdsale(rate, wallet, token)
    {
        kyc = _kyc;
    }

    // We're overriding the function of the base class, so it is not virtual, but override
    function _preValidatePurchase(address beneficiary, uint256 weiAmount) internal view override {
        super._preValidatePurchase(beneficiary, weiAmount);
        require(kyc.kycCompleted(msg.sender), "KYC not completed, purchase not allowed");
    }
}
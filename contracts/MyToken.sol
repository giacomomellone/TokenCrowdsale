// contracts/MyToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./ERC20Mintable.sol";

contract MyToken is ERC20Mintable {
    constructor() ERC20("StarDucks Cappucino Token", "CAPPU") {

    }
}
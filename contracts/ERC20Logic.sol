//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Logic is ERC20 {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}
}
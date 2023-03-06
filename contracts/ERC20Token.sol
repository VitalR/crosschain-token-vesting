// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "hardhat/console.sol";

contract ERC20Token is ERC20 {

    constructor() ERC20("TKN", "TKN") {}

    function mint(address to, uint256 amount) external returns (bool) {
        _mint(to, amount);

        return true;
    }
}
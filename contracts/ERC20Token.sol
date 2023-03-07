// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IAnycallProxy.sol";

import "hardhat/console.sol";

contract ERC20Token is ERC20 {
    address public owner;
    IAnycallProxy public callProxy;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyExecutor() {
        require(
            msg.sender == IAnycallProxy(callProxy).executor(),
            "Only executor"
        );
        _;
    }

    constructor() ERC20("TKN", "TKN") {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) public returns (bool) {
        _mint(to, amount);

        return true;
    }

    /// @dev Set executor on the destination chain
    function setExecutor(IAnycallProxy _callProxy) external onlyOwner {
        callProxy = _callProxy;
    }

    /// @dev Call by `AnycallProxy` to execute a cross chain interaction on the destination chain
    function anyExecute(bytes calldata data) 
        external
        onlyExecutor
        returns (bool success, bytes memory result) 
    {
        (address recipient, uint256 amount) = abi.decode(data, (address, uint256));

        _mint(recipient, amount);

        return (true, "");
    }
}
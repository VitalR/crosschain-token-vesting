// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20Token.sol";
import "./IAnycallProxy.sol";

import "hardhat/console.sol";

contract CrossChainTokenVesting {
    address public owner;
    IAnycallProxy public AnyCallV7;
    ERC20Token public immutable tokenA;     // token address on main chain
    ERC20Token public immutable tokenB;     // token address on target chain
    uint256 public immutable vestingAmount;

    uint256 public immutable vestingStart;      // unix timestamp
    uint256 public immutable vestingDuration;   

    mapping(address => uint256) public vestedAmounts;
    mapping(address => uint256) public claimedAmount;
    mapping(address => bool) public beneficiaries;

    event TokensClaimed(address sender, uint256 chainId, uint256 claimableAmount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(
        ERC20Token _tokenA,
        ERC20Token _tokenB,
        uint256 _vestingStart,
        uint256 _vestingDuration,
        uint256 _vestingAmount,
        address[] memory _vestingAddresses
    ) {
        // require(_vestingStart > block.timestamp, "Start time must be in the future"); commented for running scripts
        // require(_vestingDuration > 0, "Vesting duration must be greater than zero");
        require(_vestingAmount > 0, "Vesting amount must be greater than zero");
        require(_vestingAddresses.length > 0, "At least one recipient must be specified");

        owner = msg.sender;

        tokenA = _tokenA;
        tokenB = _tokenB;
        vestingStart = _vestingStart;
        vestingDuration = _vestingDuration;
        vestingAmount = _vestingAmount;

        for (uint256 i; i < _vestingAddresses.length; ) {
            vestedAmounts[_vestingAddresses[i]] = vestingAmount;
            beneficiaries[_vestingAddresses[i]] = true;
            unchecked {
                i++;
            }
        }
    }

    function getAmountToBeClaimed(address _beneficiary)
        public
        view
        returns (uint256)
    {
        if (block.timestamp < vestingStart) {
            return 0;
        }
        uint256 _elapsedTime = block.timestamp - vestingStart;
        if (block.timestamp >= vestingStart + vestingDuration) {
            return vestedAmounts[_beneficiary] - claimedAmount[_beneficiary];
        } else {
            uint256 _vestedAmounts = (vestedAmounts[_beneficiary] * _elapsedTime) /
                vestingDuration;
            return _vestedAmounts - claimedAmount[_beneficiary];
        }
    }

    // https://docs.multichain.org/developer-guide/anycall-v7/how-to-integrate-anycall-v7
    // Fantom Testnet (4002): 0xfCea2c562844A7D385a7CB7d5a79cfEE0B673D99
    // Avalanche Fuji Testnet (43113): 0x461d52769884ca6235b685ef2040f47d30c94eb5
    // Goerli (5): 0x965f84D915a9eFa2dD81b653e3AE736555d945f4
    function claimTokens(uint256 _chainId) external payable {
        require(_chainId == 1 || _chainId == 43113, "Unsupported chain");

        uint256 _claimableAmount = getAmountToBeClaimed(msg.sender);
        require(_claimableAmount > 0, "No available tokens");

        claimedAmount[msg.sender] += _claimableAmount;

        if (_chainId == 1) {
            // Mint tokens on the main chain
            require(tokenA.mint(msg.sender, _claimableAmount), "Claim tokens on mainnet failed");
        } else {
            // Send cross-chain message using AnyCall v7
            // AnyCallV7 is a proxy contract that forwards a message to another chain
            bytes memory data = abi.encodeWithSignature("_mint(address,uint256)", msg.sender, _claimableAmount);

            IAnycallProxy(AnyCallV7).anyCall{ value: msg.value }(address(tokenB), data, _chainId, 0, "");
        }

        vestedAmounts[msg.sender] -= _claimableAmount;

        emit TokensClaimed(msg.sender, _chainId, _claimableAmount);
    }

    function setAnyCallProxy(IAnycallProxy _anyCallAddress) external onlyOwner {
        AnyCallV7 = _anyCallAddress;
    }

    receive() external payable {}

    fallback() external payable {}
}
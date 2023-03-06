// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./ERC20Token.sol";

contract CrossChainTokenVesting {
    IERC20 public immutable token;
    uint256 public immutable vestingAmount;

    uint256 public immutable vestingStart;      // unix timestamp
    uint256 public immutable vestingDuration;   

    mapping(address => uint256) public vestedAmounts;
    mapping(address => uint256) public claimedAmount;
    mapping(address => bool) public beneficiaries;

    constructor(
        IERC20 _token,
        uint256 _vestingStart,
        uint256 _vestingDuration,
        uint256 _vestingAmount,
        address[] memory _vestingAddresses
    ) {
        require(_vestingStart > block.timestamp, "Start time must be in the future");
        require(_vestingDuration > 0, "Vesting duration must be greater than zero");
        require(_vestingAmount > 0, "Vesting amount must be greater than zero");
        require(_vestingAddresses.length > 0, "At least one recipient must be specified");

        token = _token;
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
}

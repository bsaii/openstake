// SPDX-License-Identifier: MIT

pragma solidity 0.8.26;
/// @notice This contract controls the states of the StateChain contract
/// @custom:contact franzquarshie@gmail.com

error StakeChain__Unauthorized();

/**
 * @title StakeChain Extended
 * @custom:security-contact franzquarshie@gmail.com
 */
contract StakeChain_States {
	/// @notice Base percentage used for calculations, representing 100%
	uint256 public constant PERCENTAGE = 100 ether;
	address public constant OWNER = 0xd54d09a4154F47ba8a82e6BDa548bcbc348a83E2;

	address public SUSTAINABILITY_FEE_COLLECTOR =
		0xFFD0a549e6982FB553302274d342dD6673b0deEE;

	/// @notice Fee percentage deducted from each transaction
	uint256 public PLATFORM_FEE = 1 ether;
	/// @notice Settle reward percentage for the user who settles the bets
	uint256 public SETTLE_REWARD = 0.01 ether;
	/// @notice Percentage that goes to environment sustainability
	uint256 public SUSTAINABILITY_FEE = 0.5 ether;

	/// @notice Platform Account
	address public constant PLATFORM_WALLET =
		0xd54d09a4154F47ba8a82e6BDa548bcbc348a83E2;

	/**
	 * @dev Administrative
	 * @param _amount New platform fee
	 */
	function UpdatePlatformFee(uint256 _amount) public _isOwner {
		PLATFORM_FEE = _amount;
	}

	/**
	 * @dev Administrative
	 * @param _amount New Sustainability fee
	 */
	function UpdateSustainabilityFee(uint256 _amount) public _isOwner {
		SUSTAINABILITY_FEE = _amount;
	}

	/**
	 * @dev Administrative
	 * @param newCollector Update sustainability fee collector
	 */
	function UpdateSustainabilityFeeCollector(
		address newCollector
	) public _isOwner {
		SUSTAINABILITY_FEE_COLLECTOR = newCollector;
	}

	modifier _isOwner() {
		if (msg.sender != OWNER) {
			revert StakeChain__Unauthorized();
		}
		_;
	}
}

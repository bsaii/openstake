// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;
/// @notice This contract allows users to place bets
/// @custom:contact franzquarshie@gmail.com

import { StakeChain_States } from "./StakeChain_States.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error StakeChain__OnlyOwner();
error StakeChain__BetNotOpen();
error StakeChain__BetStillOpen();
error StakeChain__BetNotSettled();
error StakeChain__InvalidOutcome();
error StakeChain__BetAmountZero();
error StakeChain__BetAlreadyPlaced();
error StakeChain__BetsAlreadySettled();
error StakeChain__ShareAlreadyClaimed();
error StakeChain__NoShareAvailable();

/**
 * @title StakeChain
 * @custom:security-contact franzquarshie@gmail.com
 */
contract StakeChain is StakeChain_States, ReentrancyGuard {
	struct Bet {
		uint256 amount;
		uint256 outcome;
		bool claimed;
	}

	struct BetEvent {
		string title;
		string description;
		string[] options;
		uint256 totalPool;
		uint256 winnerPool;
		uint256 loserPool;
		uint256 outcome;
		bool betOpen;
		bool betSettled;
		mapping(address => Bet) bets;
		mapping(address => uint256) shares;
		address[] players;
	}

	uint256 public betEventCount;

	mapping(uint256 => BetEvent) public betEvents;

	event BetPlaced(
		uint256 indexed betEventId,
		address indexed player,
		uint256 amount,
		uint256 outcome
	);
	event BetSettled(uint256 indexed betEventId, uint256 outcome);
	event ShareClaimed(
		uint256 indexed betEventId,
		address indexed player,
		uint256 amount
	);
	event SCHAINDistributed(address indexed player, uint256 amount);
	event BetEventCreated(
		uint256 indexed betEventId,
		string title,
		string description,
		string[] options
	);

	modifier onlyOwner() {
		if (msg.sender != OWNER) revert StakeChain__OnlyOwner();
		_;
	}

	modifier betIsOpen(uint256 _betEventId) {
		if (!betEvents[_betEventId].betOpen) revert StakeChain__BetNotOpen();
		_;
	}

	modifier betIsClosed(uint256 _betEventId) {
		if (betEvents[_betEventId].betOpen) revert StakeChain__BetStillOpen();
		_;
	}

	modifier betIsSettled(uint256 _betEventId) {
		if (!betEvents[_betEventId].betSettled)
			revert StakeChain__BetNotSettled();
		_;
	}

	// Create a new betting event with title, description, and options
	function createBetEvent(
		string memory _title,
		string memory _description,
		string[] memory _options
	) external onlyOwner {
		betEventCount++;
		BetEvent storage newBetEvent = betEvents[betEventCount];
		newBetEvent.title = _title;
		newBetEvent.description = _description;
		newBetEvent.options = _options;
		newBetEvent.betOpen = true;

		emit BetEventCreated(betEventCount, _title, _description, _options);
	}

	// Players can place their bets
	function placeBet(
		uint256 _betEventId,
		uint256 _outcome
	) external payable betIsOpen(_betEventId) {
		if (msg.value == 0) revert StakeChain__BetAmountZero();
		if (betEvents[_betEventId].bets[msg.sender].claimed)
			revert StakeChain__BetAlreadyPlaced();

		BetEvent storage _betEvent = betEvents[_betEventId];

		_betEvent.bets[msg.sender] = Bet(msg.value, _outcome, false);
		_betEvent.players.push(msg.sender);
		_betEvent.totalPool += msg.value;

		emit BetPlaced(_betEventId, msg.sender, msg.value, _outcome);
	}

	// Close betting and set the outcome for a specific  bet event
	function closeBetting(
		uint256 _betEventId,
		uint256 _outcome
	) external onlyOwner betIsOpen(_betEventId) {
		if (_outcome == 0 || _outcome > betEvents[_betEventId].options.length)
			revert StakeChain__InvalidOutcome();
		betEvents[_betEventId].outcome = _outcome;
		betEvents[_betEventId].betOpen = false;
		emit BetSettled(_betEventId, _outcome);
	}

	// Settle the bets and assign shares for a specific bet event
	function settleBets(
		uint256 _betEventId
	) external nonReentrant betIsClosed(_betEventId) {
		if (betEvents[_betEventId].betSettled)
			revert StakeChain__BetsAlreadySettled();

		BetEvent storage _betEvent = betEvents[_betEventId];

		// Calculate the total pools for winners and losers
		for (uint256 i = 0; i < _betEvent.players.length; i++) {
			address player = _betEvent.players[i];
			if (_betEvent.bets[player].outcome == _betEvent.outcome) {
				_betEvent.winnerPool += _betEvent.bets[player].amount;
			} else {
				_betEvent.loserPool += _betEvent.bets[player].amount;
			}
		}

		// Calculate and deduct platform fees
		uint256 platformFee = (_betEvent.totalPool * PLATFORM_FEE) / PERCENTAGE;
		uint256 sustainabilityFee = (_betEvent.totalPool * SUSTAINABILITY_FEE) /
			PERCENTAGE;
		uint256 settlerReward = (_betEvent.totalPool * SETTLE_REWARD) /
			PERCENTAGE;

		// Calculate the remaining pool after fees
		uint256 remainingPool = _betEvent.totalPool -
			platformFee -
			sustainabilityFee -
			settlerReward;

		// Send platform fee to PLATFORM_WALLET
		payable(PLATFORM_WALLET).transfer(platformFee);

		// Send sustainability fee to SUSTAINABILITY_FEE_COLLECTOR
		payable(SUSTAINABILITY_FEE_COLLECTOR).transfer(sustainabilityFee);

		// Assign shares to winners
		for (uint256 i = 0; i < _betEvent.players.length; i++) {
			address player = _betEvent.players[i];
			if (_betEvent.bets[player].outcome == _betEvent.outcome) {
				_betEvent.shares[player] =
					(_betEvent.bets[player].amount * remainingPool) /
					_betEvent.winnerPool;
			}
		}

		// Transfer settle reward to the caller
		payable(msg.sender).transfer(settlerReward);

		_betEvent.betSettled = true;

		emit BetSettled(_betEventId, _betEvent.outcome);
	}

	// Users claim their shares for a specific  bet event
	function claimShare(
		uint256 _betEventId
	) external betIsSettled(_betEventId) {
		BetEvent storage _betEvent = betEvents[_betEventId];
		if (_betEvent.bets[msg.sender].claimed)
			revert StakeChain__ShareAlreadyClaimed();
		uint256 share = _betEvent.shares[msg.sender];
		if (share == 0) revert StakeChain__NoShareAvailable();

		_betEvent.bets[msg.sender].claimed = true;
		payable(msg.sender).transfer(share + _betEvent.bets[msg.sender].amount);

		emit ShareClaimed(
			_betEventId,
			msg.sender,
			share + _betEvent.bets[msg.sender].amount
		);
	}

	// In case there are any leftover funds, the owner can withdraw them
	function withdrawFunds(
		uint256 _betEventId
	) external onlyOwner betIsSettled(_betEventId) {
		payable(OWNER).transfer(address(this).balance);
	}
}

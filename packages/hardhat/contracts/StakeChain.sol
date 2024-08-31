// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

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
error StakeChain__NoShareAvailable();

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

	function placeBet(
		uint256 _betEventId,
		uint256 _outcome
	) external payable betIsOpen(_betEventId) {
		if (msg.value == 0) revert StakeChain__BetAmountZero();
		if (betEvents[_betEventId].bets[msg.sender].amount > 0)
			revert StakeChain__BetAlreadyPlaced();

		BetEvent storage _betEvent = betEvents[_betEventId];

		_betEvent.bets[msg.sender] = Bet(msg.value, _outcome, false);
		_betEvent.players.push(msg.sender);
		_betEvent.totalPool += msg.value;

		emit BetPlaced(_betEventId, msg.sender, msg.value, _outcome);
	}

	function closeBetting(
		uint256 _betEventId,
		uint256 _outcome
	) external onlyOwner betIsOpen(_betEventId) {
		if (_outcome == 0 || _outcome > betEvents[_betEventId].options.length)
			revert StakeChain__InvalidOutcome();

		BetEvent storage _betEvent = betEvents[_betEventId];
		_betEvent.outcome = _outcome;
		_betEvent.betOpen = false;

		emit BetSettled(_betEventId, _outcome);
	}

	function settleBets(
		uint256 _betEventId
	) external nonReentrant betIsClosed(_betEventId) {
		BetEvent storage _betEvent = betEvents[_betEventId];
		if (_betEvent.betSettled) revert StakeChain__BetsAlreadySettled();

		uint256 totalWinningBets = 0;
		for (uint256 i = 0; i < _betEvent.players.length; i++) {
			address player = _betEvent.players[i];
			if (_betEvent.bets[player].outcome == _betEvent.outcome) {
				totalWinningBets += _betEvent.bets[player].amount;
			}
		}

		// Calculate and deduct fees
		uint256 platformFee = (_betEvent.totalPool * PLATFORM_FEE) / PERCENTAGE;
		uint256 sustainabilityFee = (_betEvent.totalPool * SUSTAINABILITY_FEE) /
			PERCENTAGE;
		uint256 settlerReward = (_betEvent.totalPool * SETTLE_REWARD) /
			PERCENTAGE;
		uint256 remainingPool = _betEvent.totalPool -
			platformFee -
			sustainabilityFee -
			settlerReward;

		// Transfer fees
		(bool platformFeeSent, ) = PLATFORM_WALLET.call{ value: platformFee }(
			""
		);
		require(platformFeeSent, "Platform fee transfer failed");

		(bool sustainabilityFeeSent, ) = SUSTAINABILITY_FEE_COLLECTOR.call{
			value: sustainabilityFee
		}("");
		require(sustainabilityFeeSent, "Sustainability fee transfer failed");

		// Transfer settler reward to the caller
		(bool settlerRewardSent, ) = msg.sender.call{ value: settlerReward }(
			""
		);
		require(settlerRewardSent, "Settler reward transfer failed");

		// Distribute winnings to winners
		if (totalWinningBets > 0) {
			for (uint256 i = 0; i < _betEvent.players.length; i++) {
				address player = _betEvent.players[i];
				if (_betEvent.bets[player].outcome == _betEvent.outcome) {
					uint256 winnings = (_betEvent.bets[player].amount *
						remainingPool) / totalWinningBets;
					(bool winningsSent, ) = player.call{ value: winnings }("");
					require(winningsSent, "Winnings transfer failed");
					emit ShareClaimed(_betEventId, player, winnings);
				}
			}
		}

		_betEvent.betSettled = true;
	}
}

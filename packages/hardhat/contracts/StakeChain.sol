// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract StakeChain {
	struct Bet {
		uint256 amount;
		uint256 outcome;
		bool claimed;
	}

	struct BetEvent {
		uint256 totalPool;
		uint256 winnerPool;
		uint256 loserPool;
		uint256 settleReward; // 0.01% reward for calling settle
		uint256 outcome;
		bool betOpen;
		bool betSettled;
		mapping(address => Bet) bets;
		mapping(address => uint256) shares;
		address[] players;
	}

	address public owner;
	uint256 public betEventCount;
	IERC20 public guessToken;
	uint256 public platformFee; // Global platform fee (e.g., 2%)
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
	event GUESSDistributed(address indexed player, uint256 amount);

	constructor(address _guessTokenAddress, uint256 _platformFee) {
		owner = msg.sender;
		guessToken = IERC20(_guessTokenAddress);
		platformFee = _platformFee; // Set global platform fee
	}

	modifier onlyOwner() {
		require(msg.sender == owner, "Only the owner can call this function");
		_;
	}

	modifier betIsOpen(uint256 _betEventId) {
		require(
			betEvents[_betEventId].betOpen,
			"Betting is not open for this bet event"
		);
		_;
	}

	modifier betIsClosed(uint256 _betEventId) {
		require(
			!betEvents[_betEventId].betOpen,
			"Betting is still open for this bet event"
		);
		_;
	}

	modifier betIsSettled(uint256 _betEventId) {
		require(
			betEvents[_betEventId].betSettled,
			"Betting is not settled yet for this bet event"
		);
		_;
	}

	// Create a new betting event
	function createBetEvent() external onlyOwner {
		betEventCount++;
		betEvents[betEventCount].settleReward = 1; // 0.01% of the pool
		betEvents[betEventCount].betOpen = true;
	}

	// Players can place their bets
	function placeBet(
		uint256 _betEventId,
		uint256 _outcome
	) external payable betIsOpen(_betEventId) {
		require(msg.value > 0, "Bet amount must be greater than zero");
		require(
			!betEvents[_betEventId].bets[msg.sender].claimed,
			"Bet already placed"
		);

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
		require(_outcome == 1 || _outcome == 2, "Invalid outcome");
		betEvents[_betEventId].outcome = _outcome;
		betEvents[_betEventId].betOpen = false;
		emit BetSettled(_betEventId, _outcome);
	}

	// Settle the bets and assign shares for a specific  bet event
	function settleBets(uint256 _betEventId) external betIsClosed(_betEventId) {
		require(
			!betEvents[_betEventId].betSettled,
			"Bets already settled for this bet event"
		);

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

		// Deduct platform fees
		// uint256 fee = (_betEvent.totalPool * platformFee) / 100;
		uint256 reward = (_betEvent.totalPool * _betEvent.settleReward) / 10000;
		// uint256 poolAfterFee = _betEvent.totalPool - fee - reward;

		// Assign shares to winners
		for (uint256 i = 0; i < _betEvent.players.length; i++) {
			address player = _betEvent.players[i];
			if (_betEvent.bets[player].outcome == _betEvent.outcome) {
				_betEvent.shares[player] =
					(_betEvent.bets[player].amount * _betEvent.loserPool) /
					_betEvent.winnerPool;
			}
			// Assign GUESS tokens for both winners and losers
			_distributeGUESS(player);
		}

		// Transfer settle reward to the caller
		payable(msg.sender).transfer(reward);

		_betEvent.betSettled = true;
	}

	// Users claim their shares for a specific  bet event
	function claimShare(
		uint256 _betEventId
	) external betIsSettled(_betEventId) {
		BetEvent storage _betEvent = betEvents[_betEventId];
		require(!_betEvent.bets[msg.sender].claimed, "Share already claimed");
		uint256 share = _betEvent.shares[msg.sender];
		require(share > 0, "No share available");

		_betEvent.bets[msg.sender].claimed = true;
		payable(msg.sender).transfer(share + _betEvent.bets[msg.sender].amount);

		emit ShareClaimed(
			_betEventId,
			msg.sender,
			share + _betEvent.bets[msg.sender].amount
		);
	}

	// Distribute GUESS tokens (now using the ERC20 token standard)
	function _distributeGUESS(address player) internal {
		uint256 guessTokens = 100 * 10 ** 18; // Example: distribute 100 GUESS tokens, adjust as needed
		guessToken.transfer(player, guessTokens);
		emit GUESSDistributed(player, guessTokens);
	}

	// In case there are any leftover funds, the owner can withdraw them
	function withdrawFunds(
		uint256 _betEventId
	) external onlyOwner betIsSettled(_betEventId) {
		payable(owner).transfer(address(this).balance);
	}
}

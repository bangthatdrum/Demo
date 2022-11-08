	// SPDX-License-Identifier: unlicensed
	pragma solidity ^0.8.0;

	import "hardhat/console.sol";
	import "./Token.sol";

	contract Exchange {
		address public feeAccount;
		uint256 public feePercent;
		// Token address then user address
		mapping(address => mapping(address => uint256)) public tokens; // on exchange
		mapping(uint256 => _Order) public orders;
		uint256 public ordersCount;
		
		event Deposit(address token, address user, uint256 amount, uint256 balance);
		event Withdrawal(address token, address user, uint256 amount, uint256 balance);
		event Order ( 
			uint256 id,
			address user,
			address tokenGet,
			uint256 amountGet, 
			address tokenGive, 
			uint256 amountGive,
			uint256 timestamp
		);	

		struct _Order { 
			uint256 id;
			address user;
			address tokenGet;
			uint256 amountGet; 
			address tokenGive; 
			uint256 amountGive;
			uint256 timestamp;
		}

		constructor(address _feeAccount, uint256 _feePercent) {
			feeAccount = _feeAccount;
			feePercent = _feePercent;
		}	

		// ------------------------
		// DEPOSIT & WITHDRAW TOKEN

		function depositToken(address _token, uint256 _amount) public {
			// Transfer to exchange from user
			Token(_token).transferFrom(msg.sender, address(this), _amount);

			// Update user balance
			tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

			// Emit an event
			emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
		}

		function withdrawToken(address _token, uint256 _amount) public { 
			// Ensure user has sufficient tokens to withdraw
			require(tokens[_token][msg.sender] >= _amount, "Exchange: Insufficient tokens to withdraw");

			// Transfer from exchange to user (no approval necessary)
			Token(_token).transfer(msg.sender, _amount);

			// Update user balance
			tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

			// Emit an event
			emit Withdrawal(_token, msg.sender, _amount, tokens[_token][msg.sender]);
		}

		// Check balance
		function balanceOf(address _token, address _user) public view returns (uint256) {
			return tokens[_token][_user];
		}

		// ------------------------
		// MAKE & CANCEL ORDERS

		function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public
		{
			// Check tokens are on the exchange
			require(balanceOf(_tokenGive, msg.sender) >= _amountGive, "Exchange: Insufficient tokens on exhange to make order");

			// Instantiate new order
			ordersCount = ordersCount + 1;
			orders[ordersCount] = _Order(
				ordersCount, // id 1, 2, 3, ... 
				msg.sender,  // user address
				_tokenGet,
				_amountGet,
				_tokenGive,
				_amountGive,
				block.timestamp // time since certain date
			);

			// Emit order event
			emit Order ( 
				ordersCount, // id 1, 2, 3, ... 
				msg.sender,  // user address
				_tokenGet,
				_amountGet,
				_tokenGive,
				_amountGive,
				block.timestamp // time since certain date
			);	

		}


	}
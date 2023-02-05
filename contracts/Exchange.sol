	// SPDX-License-Identifier: unlicensed
	pragma solidity ^0.8.0;

	import "hardhat/console.sol";
	import "./Token.sol";

	contract Exchange {
		address public feeAccount;
		uint256 public feePercent;
		// Token address then user address gives tokens on exchange
		mapping(address => mapping(address => uint256)) public tokens;
		mapping(uint256 => _Order) public orders;
		mapping(uint256 => bool) public orderCancelled;
		mapping(uint256 => bool) public orderFilled;

		uint256 public ordersCount;

		constructor(address _feeAccount, uint256 _feePercent) {
			feeAccount = _feeAccount;
			feePercent = _feePercent;
		}	

		struct _Order { 
			uint256 id;
			address user;
			address tokenGet;
			uint256 amountGet; 
			address tokenGive; 
			uint256 amountGive;
			uint256 timestamp;
		}
		
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
		event Cancel (
			uint256 id,
			address user,
			address tokenGet,
			uint256 amountGet, 
			address tokenGive, 
			uint256 amountGive,
			uint256 timestamp
		);
		event Trade (
			uint256 id,
			address filler,
			address tokenGet,
			uint256 amountGet, 
			address tokenGive, 
			uint256 amountGive,
			address maker,
			uint256 timestamp
		);

		// ------------------------
		// DEPOSIT & WITHDRAW TOKEN

		function depositToken(address _token, uint256 _amount) public {
			// Transfer from user to exchange, 
			// origin of contract call -> contract instance
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

		// --------------------
		// MAKE & CANCEL ORDERS

		function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public
		{
			// Check tokens are on the exchange
			require(balanceOf(_tokenGive, msg.sender) >= _amountGive, "Exchange: Insufficient tokens on exhange to make order");

			// Instantiate new order
			ordersCount++;

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

		function cancelOrder(uint256 _id) public {
			// Fetch order
			_Order storage _order = orders[_id];

			// Check order exists
			require(_order.id == _id, "Exchange: Order does not exist");
			
			// Ensure caller is the owner of the order
			require(address(_order.user) == msg.sender, "Exchange: Not order owner");

			// Cancel order
			orderCancelled[_id] = true;

			// Emit event
			emit Cancel (
				_order.id,
				msg.sender,
				_order.tokenGet,
				_order.amountGet, 
				_order.tokenGive,
				_order.amountGive,
				block.timestamp
			);
		}

		// ----------------
		// EXECUTING ORDERS

		function fillOrder(uint256 _id) public {
			// 1. Must be valid orderId
			require(_id > 0 &&_id <= ordersCount, "Exchange: Invalid order ID");
			// 2. Order can't be filled
			require(orderFilled[_id] == false, "Exchange: Order already filled");
			// 3. Order can't be cancelled
			require(orderCancelled[_id] == false, "Exchange: Order already cancelled");

			// Fetch order
			_Order storage _order = orders[_id];

			// Execute the trade
			_trade(
				_order.id, 
				_order.user, 
				_order.tokenGet, 
				_order.amountGet,
				_order.tokenGive,
				_order.amountGive
			);

			// Mark order as filled
			orderFilled[_order.id] = true;

		}

		function _trade(
			uint256 _orderId, 
			address _user, 
			address _tokenGet, 
			uint256 _amountGet,
			address _tokenGive,
			uint256 _amountGive
			) internal {

			// Fee is paid by the user who filled the order (msg.sender)
			// Fee is deducted from _amountGet
			uint256 _feeAmount = (_amountGet * feePercent/100);	
		
			// User 1 make order 
			tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;
			tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;				
			
			// User 2 fill order
			tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;
			tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + _feeAmount);
			
			// Charge fees
			tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;

			// Emit Trade event
			emit Trade (
				_orderId, 
				msg.sender, // fill order
				_tokenGet, 
				_amountGet,
				_tokenGive,
				_amountGive,
				_user, // make order
				block.timestamp
				);
			
		}

	}
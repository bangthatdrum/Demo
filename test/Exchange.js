const { expect } = require("chai");
const { ethers } = require("hardhat");

function toWei(value) {
	return ethers.utils.parseUnits(value.toString());
}

function toEther(value) {
	return ethers.utils.formatUnits(value.toString());
}

function toBigNum(value) {
	return ethers.BigNumber.from(value.toString());
}

describe("Exchange", function () {
	let accounts, deployer, feeAccount, exchange;
	const feePercent = 10;
	const totalSupply = 1; // Unit of ETH (converts to WEI)

	beforeEach(async function () {
		accounts = await ethers.getSigners();

		// Total supply is assigned to deployer of contract
		deployer = accounts[0];
		feeAccount = accounts[1];
		user1 = accounts[2];
		user2 = accounts[3];

		// Deploy exchange contract
		const Exchange = await ethers.getContractFactory("Exchange");
		exchange = await Exchange.deploy(feeAccount.address, feePercent);

		// Get token contract factory
		const Token = await ethers.getContractFactory("Token");
		// Deploy token 1 contract
		token1 = await Token.deploy("Token 1", "Token 1 Symbol", totalSupply);
		// Deploy token 2 contract
		token2 = await Token.deploy("Mock DAI", "mDAI", totalSupply);

		// Transfer some tokens from deployer (total supply given) to user1 
		transaction = await token1.connect(deployer).transfer(user1.address, toWei(1));
	});
	
	describe("Deployment", function () {
		it("Track the fee account address", async function () {  
			expect(await exchange.feeAccount()).to.equal(feeAccount.address);
		});
		it("Track the fee percent", async function () {  
			expect(await exchange.feePercent()).to.equal(feePercent);
		});
	});

	describe("Depositing tokens", function () {
		let actualAmount, approvedAmount, result1, result2;
		describe("Success", function () {   
			beforeEach(async function () { 
				approvedAmount = toWei(2);
				actualAmount = toWei(1);

				// User1 connects to token contract, user1 approves exchange to transfer that amount
				transaction = await token1.connect(user1).approve(exchange.address, approvedAmount);
				result1 = await transaction.wait();

				// User1 connects to exchange contract, exchange transfers that amount from user1 to exchange
				transaction = await exchange.connect(user1).depositToken(token1.address, actualAmount);				
				result2 = await transaction.wait();			
			});
			it("Tracks the token deposit", async function () {  
				expect(await token1.balanceOf(exchange.address)).to.equal(actualAmount);
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(actualAmount);
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(actualAmount);
			});
			it("Emits a deposit event", async function () {        
				const events = result2.events[1]; // transferFrom emits an event also
				const args = result2.events[1].args; 
				expect(events.event).to.equal("Deposit");
				expect(args.token).to.equal(token1.address);
				expect(args.user).to.equal(user1.address);
				expect(args.amount).to.equal(actualAmount);    
				expect(args.balance).to.equal(actualAmount);   
			});
		});
		describe("Failure", function () {   
			it("Fails when no tokens are approved", async function () { 
				await expect(exchange.connect(user1).depositToken(token1.address, actualAmount)).to.be.revertedWith('Token: Insufficient allowance');	
			});
		});
	});

	describe("Withdrawing tokens", function () {
		let amount, result1, result2, result3;
		describe("Success", function () {   
			beforeEach(async function () { 
				amount = toWei(1);

				// Approve: user1 connects to token contract, user1 approves exchange to transfer that amount
				transaction = await token1.connect(user1).approve(exchange.address, amount);
				result1 = await transaction.wait();

				// Deposit: user1 connects to exchange contract, exchange transfers that amount from user1 to exchange
				transaction = await exchange.connect(user1).depositToken(token1.address, amount);				
				result2 = await transaction.wait();			

				// Withdraw: user1 connects to exchange contract, exchange transfers that amount to user1
				transaction = await exchange.connect(user1).withdrawToken(token1.address, amount);				
				result3 = await transaction.wait();			
			});
			it("Tracks the token withdrawal", async function () {  
				// Exchange has zero tokens
				expect(await token1.balanceOf(exchange.address)).to.equal(amount-amount);
				// User1 has this many tokens
				expect(await token1.balanceOf(user1.address)).to.equal(amount);
				// Exchange ledger has zero tokens belonging to user1 (equivalent results)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount-amount);
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount-amount);
			});
			it("Emits a withdrawal event", async function () {        
				const events = result3.events[1]; // transferFrom emits an event before this
				const args = result3.events[1].args; 
				expect(events.event).to.equal("Withdrawal"); 
				expect(args.token).to.equal(token1.address); 
				expect(args.user).to.equal(user1.address); 
				expect(args.amount).to.equal(amount); 
				expect(args.balance).to.equal(amount-amount); 
			});
		});
		describe("Failure", function () {   
			it("Fails for insufficient balance", async function () { 
				// Attempt to withdraw tokens without depositing
				await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.revertedWith('Exchange: Insufficient tokens to withdraw');				
			});
		});
	});

	describe("Checking balances", function () {
		let actualAmount, approvedAmount, result1, result2;		 
		beforeEach(async function () { 
			approvedAmount = toWei(2);
			actualAmount = toWei(1);

				// Approve: user1 connects to token contract, user1 approves exchange to transfer that amount
				transaction = await token1.connect(user1).approve(exchange.address, approvedAmount);
				result1 = await transaction.wait();

				// Deposit: user1 connects to exchange contract, exchange transfers that amount from user1 to exchange
				transaction = await exchange.connect(user1).depositToken(token1.address, actualAmount);				
				result2 = await transaction.wait();			
			});
		it("Returns user balance", async function () {  
			expect(await token1.balanceOf(exchange.address)).to.equal(actualAmount);
			expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(actualAmount);
		});
	});

	describe("Making orders", function () {
		let transaction, result1, result2, result3;	 

		describe("Success", function () {

			beforeEach(async function () { 	
				approvedAmount = toWei(1);
				actualAmount = toWei(1);

				// Approve amount
				transaction = await token1.connect(user1).approve(exchange.address, approvedAmount);
				result1 = await transaction.wait();

				// Deposit amount
				transaction = await exchange.connect(user1).depositToken(token1.address, actualAmount);				
				result2 = await transaction.wait();	

				// Make order
				transaction = await exchange.connect(user1).makeOrder(token2.address, toWei(1), token1.address, toWei(1));	
				result3 = await transaction.wait();		
			});

			it("Tracks the newly created order", async function () {  
				expect(await exchange.ordersCount()).to.equal(1);
			});

			it("Emits an order event", async function () {  
				const event = result3.events[0];
				expect(event.event).to.equal('Order');

				const args = event.args;
				expect(args.id).to.equal(1);
				expect(args.user).to.equal(user1.address);
				expect(args.tokenGet).to.equal(token2.address);
				expect(args.amountGet).to.equal(toWei(1));
				expect(args.tokenGive).to.equal(token1.address);
				expect(args.amountGive).to.equal(toWei(1));
			});

		});

		describe("Failure", function () {
			it('Rejects with insufficient balance', async () => {
				approvedAmount = toWei(1);
				actualAmount = toWei(0.1);

				// Approve amount
				transaction = await token1.connect(user1).approve(exchange.address, approvedAmount);
				result1 = await transaction.wait();

				// Deposit amount
				transaction = await exchange.connect(user1).depositToken(token1.address, actualAmount);				
				result2 = await transaction.wait();	

				// Make order
				await expect(exchange.connect(user1).makeOrder(token2.address, toWei(1), token1.address, toWei(1))).to.be.revertedWith('Exchange: Insufficient tokens on exhange to make order');	;
			});
		});

	});

	describe("Cancelling orders", function () {
		beforeEach(async function () { 	
			approvedAmount = toWei(1);
			actualAmount = toWei(1);

			// Approve amount
			transaction = await token1.connect(user1).approve(exchange.address, approvedAmount);
			result1 = await transaction.wait();

			// Deposit amount
			transaction = await exchange.connect(user1).depositToken(token1.address, actualAmount);				
			result2 = await transaction.wait();	

			// Make order
			transaction = await exchange.connect(user1).makeOrder(token2.address, toWei(1), token1.address, toWei(1));	
			result3 = await transaction.wait();			
		});
		describe("Success", function () {
			beforeEach(async function () { 	
				transaction = await exchange.connect(user1).cancelOrder(1);
				result = await transaction.wait();
			});
			it("Updates cancelled orders", async function () {  
				expect(await exchange.orderCancelled(1)).to.equal(true);
			});
			it("Emits a cancel event", async function () {  
				const event = result.events[0];
				expect(event.event).to.equal('Cancel');

				const args = event.args;
				expect(args.id).to.equal(1);
				expect(args.user).to.equal(user1.address);
				expect(args.tokenGet).to.equal(token2.address);
				expect(args.amountGet).to.equal(toWei(1));
				expect(args.tokenGive).to.equal(token1.address);
				expect(args.amountGive).to.equal(toWei(1));
			});
		});
		describe("Failure", function () {
			it("Rejects invalid order IDs", async function () {  
				const invalidOrderID = 2;
				await expect(exchange.connect(user1).cancelOrder(invalidOrderID)).to.be.revertedWith('Exchange: Order does not exist');
				result = await transaction.wait();				
			});
			it("Rejects unauthorized cancellations", async function () {  
				const validOrderID = 1;
				await expect(exchange.connect(user2).cancelOrder(validOrderID)).to.be.revertedWith('Exchange: Not order owner');
			});
		});

	});

});


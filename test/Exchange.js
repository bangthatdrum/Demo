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
	const totalSupply = 1;

	beforeEach(async function () {
		accounts = await ethers.getSigners();

		// Total supply is assigned to deployer
		deployer = accounts[0];
		feeAccount = accounts[1];
		user1 = accounts[2];

		// Deploy exchange contract
		const Exchange = await ethers.getContractFactory("Exchange");
		exchange = await Exchange.deploy(feeAccount.address, feePercent);

		// Deploy token contract
		const Token1 = await ethers.getContractFactory("Token");
		token1 = await Token1.deploy("Token 1", "Token 1 Symbol", totalSupply);

		// Transfer some tokens from deployer to user1 
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
				await expect(exchange.connect(user1).depositToken(token1.address, actualAmount)).to.be.revertedWith('Insufficient allowance');	
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
				// Exchange address wallet has this many tokens of that type
				expect(await token1.balanceOf(exchange.address)).to.equal(amount-amount);
				// User1 address wallet has this many tokens of that type
				expect(await token1.balanceOf(user1.address)).to.equal(amount);

				// Exchange 
				//expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount-amount);
				//expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount-amount);
			});
			// it("Emits a deposit event", async function () {        
			// 	const events = result2.events[1]; // transferFrom emits an event also
			// 	const args = result2.events[1].args; 
			// 	expect(events.event).to.equal("Deposit");
			// 	expect(args.token).to.equal(token1.address);
			// 	expect(args.user).to.equal(user1.address);
			// 	expect(args.amount).to.equal(actualAmount);    
			// 	expect(args.balance).to.equal(actualAmount);   
			// });
		});
		// describe("Failure", function () {   
		// 	it("Fails when no tokens are approved", async function () { 
		// 		await expect(exchange.connect(user1).depositToken(token1.address, actualAmount)).to.be.revertedWith('Insufficient allowance');	
		// 	});
		//});
	});
});

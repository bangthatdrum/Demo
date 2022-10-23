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

describe("Token contract", function () {
	const name = "My Token";
	const symbol = "My Token Symbol";
	const decimals = 18;
	const totalSupply = 1;
	let token, accounts, deployer, receiver, exchange;
	beforeEach(async function () {
		const Token = await ethers.getContractFactory("Token");
		token = await Token.deploy(name, symbol, totalSupply);   
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		receiver = accounts[1];
		exchange = accounts[2];
	});
	
	describe("Deployment", function () {
		it("has the correct name", async function () {  
			expect(await token.name()).to.equal(name);
		});
		it("has the correct symbol", async function () {  
			expect(await token.symbol()).to.equal(symbol);
		});
		it("has the correct decimals", async function () {  
			expect(await token.decimals()).to.equal(decimals);
		});
		it("has the correct total supply", async function () {  
			expect(await token.totalSupply()).to.equal(toBigNum(totalSupply*10**decimals));
		});
		it("assigns total supply to deployer", async function () {  
			expect(await token.balanceOf(deployer.address)).to.equal(toBigNum(totalSupply*10**decimals));
		});
	});

	describe("Sending Tokens", function () {
		let amount, transaction, result;
		beforeEach(async function () {
			amount = toWei(1);      
			//console.log("Deployer balance before:", toEther(await token.balanceOf(deployer.address)));
			//console.log("Reciever balance before:", toEther(await token.balanceOf(reciever.address)));
			transaction = await token.connect(deployer).transfer(receiver.address, amount);
			result = await transaction.wait();
			//console.log("Deployer balance after:", toEther(await token.balanceOf(deployer.address)));
			//console.log("Reciever balance after:", toEther(await token.balanceOf(reciever.address)));
		});
		describe("Success", function () {
			it("Transfers token balance", async function () {                
				expect(await token.balanceOf(deployer.address)).to.equal(totalSupply*10**decimals-amount);
				expect(await token.balanceOf(receiver.address)).to.equal(amount);
			});
			it("Emits a transfer event", async function () {        
				const events = result.events[0];
				const args = result.events[0].args;                     
				expect(events.event).to.equal("Transfer");
				expect(args.from).to.equal(deployer.address);
				expect(args.to).to.equal(receiver.address);
				expect(args.value).to.equal(amount);                    
			});
		});
		describe("Failure", function () {
			it("Rejects insufficient balances", async function () {         
				invalidAmount = toWei(2);       
				await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.revertedWith("Token: Insufficient balance");
			});
			it("Rejects invalid recipient", async function () {     
				await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.revertedWith("Token: Invalid recipient address");
			});
		});		
	});

	describe("Approving Tokens", function () {
		let amount, transaction, result;
		beforeEach(async function () {
			amount = toWei(1);      
			transaction = await token.connect(deployer).approve(exchange.address, amount);
			result = await transaction.wait();
		});
		describe("Success", function () {
			it("Allocates an allowance for delegated token spending", async function () {   
				expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount); 
			}); 
			it("Emits an approval event", async function () {        
				const events = result.events[0];
				const args = result.events[0].args;                     
				expect(events.event).to.equal("Approval");
				expect(args.owner).to.equal(deployer.address);
				expect(args.spender).to.equal(exchange.address);
				expect(args.value).to.equal(amount);                    
			});
		});
		describe("Failure", function () {
			it("Rejects invalid spenders", async function () {     
				amount = toWei(1);      
				await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.revertedWith("Token: Invalid spender");
			});
		});		
	});

	describe("Delegated Token Transfers", function () {
		let amount, transaction, result;
		beforeEach(async function () {
			approvedAmount = toWei(1);      
			actualAmount = toWei(0.5);
			transaction = await token.connect(deployer).approve(exchange.address, approvedAmount);
			result = await transaction.wait();
		});
		describe("Success", function () {
			beforeEach(async function () {
				transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, actualAmount);
				result = await transaction.wait();
			});
			it("Transfers token balances", async function() {
				expect(await token.balanceOf(deployer.address)).to.equal(toBigNum(totalSupply*10**decimals-actualAmount));
				expect(await token.balanceOf(receiver.address)).to.equal(actualAmount);
			});
			it("Resets the allowance", async function() {
				expect(await token.allowance(deployer.address, exchange.address)).to.equal(toBigNum(approvedAmount-actualAmount));
			});
			it("Emits a transfer event", async function () {        
				const events = result.events[0];
				const args = result.events[0].args;  
				expect(events.event).to.equal("Transfer");
				expect(args.from).to.equal(deployer.address);
				expect(args.to).to.equal(receiver.address);
				expect(args.value).to.equal(actualAmount);                    
			});
		});	
		describe("Failure", async function () {
			it("Rejects insufficient balances", async function () { 
				const invalidAmount = toWei(1.1);   
				await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.revertedWith("Token: Insufficient balance");
			});
		});
	});
});

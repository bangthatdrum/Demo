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

	beforeEach(async function () {
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		feeAccount = accounts[1];
		user1 = accounts[2];

		const Exchange = await ethers.getContractFactory("Exchange");
		exchange = await Exchange.deploy(feeAccount.address, feePercent);

		const Token1 = await ethers.getContractFactory("Token");
		token1 = await Token1.deploy("Token 1", "Symbol Token 1", 100);
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
		let amount, transaction, result;

		beforeEach(async function () { 
			//amount = toWei(1);  
			//transaction = await exchange.connect(user1).depositToken(token1.address, amount);
			//result = await transaction.wait();
		});

		describe("Success", function () {   
		 	it("Tracks the token deposit", async function () {  
		 	});
		});

		// describe("Failure", function () {   
		// });

	});

});

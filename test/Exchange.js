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

		const Exchange = await ethers.getContractFactory("Exchange");
		exchange = await Exchange.deploy(feeAccount.address, feePercent);   
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

		beforeEach(async function () {
		});

		describe("Success", function () {   
		}
		describe("Failure", function () {   
		}
	});

});

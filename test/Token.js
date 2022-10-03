const { expect } = require("chai");
const { ethers } = require("hardhat");

function toWei(value) {
	return ethers.utils.parseUnits(value.toString());
}

function toEther(value) {
	return ethers.utils.formatUnits(value.toString());
}

describe("Token contract", function () {

	let token, accounts, deployer, receiver;

	beforeEach(async function () {
		const Token = await ethers.getContractFactory("Token");
		token = await Token.deploy("My Token", "My Token Symbol", 1000000);   
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		reciever = accounts[1];
	});

	describe("Deployment", function () {

		const name = "My Token";
		const symbol = "My Token Symbol";
		const decimals = 18;
		const totalSupply = toWei(1000000);

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
			expect(await token.totalSupply()).to.equal(totalSupply);
		});

		it("assigns total supply to deployer", async function () {  
			expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
		});

	});

	describe("Sending Tokens", function () {
		let amount, transaction, result;

		beforeEach(async function () {
			amount = toWei(100);	
			console.log("Deployer balance before:", toEther(await token.balanceOf(deployer.address)));
			console.log("Reciever balance before:", toEther(await token.balanceOf(reciever.address)));
			transaction = await token.connect(deployer).transfer(reciever.address, amount);
			let result = transaction.wait();
			console.log("Deployer balance after:", toEther(await token.balanceOf(deployer.address)));
			console.log("Reciever balance after:", toEther(await token.balanceOf(reciever.address)));
		});

		it("Transfers token balance", async function () {  			
			expect(await token.balanceOf(deployer.address)).to.equal(toWei(999900));
			expect(await token.balanceOf(reciever.address)).to.equal(toWei(100));
		});
	});

});
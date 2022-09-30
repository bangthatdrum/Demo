const { expect } = require("chai");
const { ethers } = require("hardhat");

function tokens(number) {
	return ethers.utils.parseUnits(number.toString(), 'ether');
}

describe("Token contract", function () {

	let token, accounts, deployer;

	beforeEach(async function () {
		const Token = await ethers.getContractFactory("Token");
		token = await Token.deploy("My Token", "My Token Symbol", 1000000);   
		accounts = await ethers.getSigners();
		deployer = accounts[0];
	});

	describe("Deployment", function () {

		const name = "My Token";
		const symbol = "My Token Symbol";
		const decimals = 18;
		const totalSupply = tokens(1000000);

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

});

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

	let token, accounts, deployer, receiver;

	beforeEach(async function () {
		const Token = await ethers.getContractFactory("Token");
		token = await Token.deploy(name, symbol, totalSupply);   
		accounts = await ethers.getSigners();
		deployer = accounts[0];
		reciever = accounts[1];
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

		describe("Success", function () {

			beforeEach(async function () {
				amount = toWei(1);      
                                //console.log("Deployer balance before:", toEther(await token.balanceOf(deployer.address)));
                                //console.log("Reciever balance before:", toEther(await token.balanceOf(reciever.address)));
                                transaction = await token.connect(deployer).transfer(reciever.address, amount);
                                result = await transaction.wait();
                                //console.log("Deployer balance after:", toEther(await token.balanceOf(deployer.address)));
                                //console.log("Reciever balance after:", toEther(await token.balanceOf(reciever.address)));
                            });

			it("Transfers token balance", async function () {                
				expect(await token.balanceOf(deployer.address)).to.equal(totalSupply*10**decimals-amount);
				expect(await token.balanceOf(reciever.address)).to.equal(amount);
			});

			it("Emits a transfer event", async function () {        
				const events = result.events[0];
				const args = result.events[0].args;                     
				expect(events.event).to.equal("Transfer");
				expect(args.from).to.equal(deployer.address);
				expect(args.to).to.equal(reciever.address);
				expect(args.value).to.equal(amount);                    
			});
		});

		describe("Failure", function () {

			it("Rejects insufficient balances", async function () {         
				invalidAmount = toWei(2);       
				await expect(token.connect(deployer).transfer(reciever.address, invalidAmount)).to.be.reverted;
			});

			it("Rejects invalid recipient", async function () {     
				amount = toWei(1);      
				await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted;
			});
		});
		
	});

});

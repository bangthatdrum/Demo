// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  console.log("Preparing deployment...\n");
  // Fetch contract to deploy
  const Token = await ethers.getContractFactory("Token");
  const Exchange = await ethers.getContractFactory("Exchange");

  // Fetch accounts
  const accounts = await ethers.getSigners();
  console.log(`Acounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n${accounts[1].address}\n`);

  // Deploy 
  const token1 = await Token.deploy("Token1", "Token1", 1000000);
  await token1.deployed();
  console.log(`Token1 deployed to ${token1.address}`);

  const token2 = await Token.deploy("Token2", "Token2", 1000000);
  await token2.deployed();
  console.log(`Token2 deployed to ${token2.address}`);

  const token3 = await Token.deploy("Token3", "Token3", 1000000);
  await token3.deployed();
  console.log(`Token3 deployed to ${token3.address}`);

  const exchange = await Exchange.deploy(accounts[0].address, 50);
  await exchange.deployed();
  console.log(`Exchange deployed to: ${exchange.address}`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

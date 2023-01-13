// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const config = require("../src/config.json");

function toWei(value) {
  return ethers.utils.parseUnits(value.toString());
}

function toEther(value) {
  return ethers.utils.formatUnits(value.toString());
}

function toBigNum(value) {
  return ethers.BigNumber.from(value.toString());
}

const wait = (seconds) => {
  const milliseconds = seconds * 1000;
  return new Promise(resolve => setTimeout(resolve, milliseconds));  
}

async function main() {
  console.log("Seeding exchange...\n");

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork();
  console.log("Using chainId: ", chainId);

  // Fetch accounts
  const accounts = await ethers.getSigners();
  console.log(`\nAcounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n`);
  
  // Fetch deployed tokens
  const token1 = await ethers.getContractAt('Token', config[chainId].token1.address);
  console.log(`Token1 fetched: ${token1.address}`);

  const token2 = await ethers.getContractAt('Token', config[chainId].token2.address);
  console.log(`Token2 fetched: ${token2.address}`);

  const token3 = await ethers.getContractAt('Token', config[chainId].token3.address);
  console.log(`Token3 fetched: ${token3.address}`);

  // Fetch the deployed exchange
  const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address);
  console.log(`Exchange fetched: ${exchange.address}\n`);

  // Set up some users
  const user1 = accounts[0]; // Deployer has initial supply
  const user2 = accounts[1];

  let amount = toWei(500000);

  let transaction, result

  result = await token1.connect(user1).getBalanceOf(user1.address);
  console.log(`User1 token1 balance: ${toEther(result)}`);
  result = await token2.connect(user1).getBalanceOf(user1.address);
  console.log(`User1 token2 balance: ${toEther(result)}`);

  result = await token1.connect(user2).getBalanceOf(user2.address);
  console.log(`User2 token1 balance: ${toEther(result)}`);
  result = await token2.connect(user2).getBalanceOf(user2.address);
  console.log(`User2 token2 balance: ${toEther(result)}\n`);

  // User1 give token1 to user2
  transaction = await token1.connect(user1).transfer(user2.address, amount);
  result = await transaction.wait();
  console.log(`Transferred ${toEther(amount)} token1 from ${user1.address} to ${user2.address}\n`);

  // User1 give token2 to user2
  transaction = await token2.connect(user1).transfer(user2.address, amount);
  result = await transaction.wait();
  console.log(`Transferred ${toEther(amount)} token2 from ${user1.address} to ${user2.address}\n`);

  // // User1 transfer token1 to exchange
  // amount = toWei(1000);
  // // Approve
  // transaction = await token1.connect(user1).approve(exchange.address, amount);
  // result = await transaction.wait();
  // console.log(`Approved ${toEther(amount)} token1 from ${user1.address} to exchange`);
  // // Deposit
  // transaction = await exchange.connect(user1).depositToken(token1.address, amount);
  // result = await transaction.wait();
  // console.log(`Deposited ${toEther(amount)} token1 from ${user1.address} to exchange`);
 
  //  // User1 transfer token2 to exchange
  // amount = toWei(1000);
  // // Approve
  // transaction = await token2.connect(user1).approve(exchange.address, amount);
  // result = await transaction.wait();
  // console.log(`Approved ${toEther(amount)} token2 from ${user1.address} to exchange`);
  // // Deposit
  // transaction = await exchange.connect(user1).depositToken(token2.address, amount);
  // result = await transaction.wait();
  // console.log(`Deposited ${toEther(amount)} token2 from ${user1.address} to exchange`);

  // // User2 approve token2
  // transaction = await token2.connect(user2).approve(exchange.address, amount);
  // result = await transaction.wait();
  // console.log(`Approved ${toEther(amount)} token2 from ${user2.address} to exchange`);
  // // User2 deposit tokens2 to exchange
  // transaction = await exchange.connect(user2).depositToken(token2.address, amount);
  // result = await transaction.wait();
  // console.log(`Deposited ${toEther(amount)} token2 from ${user2.address} to exchange\n`);
  
  result = await token1.connect(user1).getBalanceOf(user1.address);
  console.log(`User1 token1 balance: ${toEther(result)}\n`);
  result = await token2.connect(user1).getBalanceOf(user1.address);
  console.log(`User1 token2 balance: ${toEther(result)}`);

  result = await token1.connect(user2).getBalanceOf(user2.address);
  console.log(`User2 token1 balance: ${toEther(result)}`);
  result = await token2.connect(user2).getBalanceOf(user2.address);
  console.log(`User2 token2 balance: ${toEther(result)}\n`);

  result = await exchange.connect(user1).balanceOf(token1.address, user1.address);
  console.log(`User1 token1 balance on exchange: ${toEther(result)}`);
  result = await exchange.connect(user1).balanceOf(token2.address, user1.address);
  console.log(`User1 token2 balance on exchange: ${toEther(result)}\n`);

  result = await exchange.connect(user1).balanceOf(token1.address, user1.address);
  console.log(`User1 token1 balance on exchange: ${toEther(result)}`);
  result = await exchange.connect(user1).balanceOf(token2.address, user1.address);
  console.log(`User1 token2 balance on exchange: ${toEther(result)}\n`);
  
  // result = await  exchange.connect(user1).balanceOf(token1.address, user1.address);
  // console.log(`User1 token1 balance on exchange: ${toEther(result)}`);
  // result = await  exchange.connect(user2).balanceOf(token1.address, user2.address);
  // console.log(`User2 token1 balance on exchange: ${toEther(result)}`);

  // result = await  exchange.connect(user1).balanceOf(token2.address, user1.address);
  // console.log(`User1 token2 balance on exchange: ${toEther(result)}`);
  // result = await  exchange.connect(user2).balanceOf(token2.address, user2.address);
  // console.log(`User2 token2 balance on exchange: ${toEther(result)}`);


  //--------------------------
  // SEED CANCELLED ORDERS
  /*
  console.log("Seeding cancelled orders...\n");

  // User1 makes order (get, give)
  transaction = await exchange.connect(user1).makeOrder(token2.address, toWei(1), token1.address, toWei(1));
  result = await transaction.wait();
  console.log(`Make order by: ${user1.address}`);

  // User1 cancels order  
  orderID = result.events[0].args.id;
  transaction = await exchange.connect(user1).cancelOrder(orderID);
  result = await transaction.wait();
  console.log(`Cancelled order by: ${user1.address}\n`);

  await wait(1);

  //-----------------------
  // SEED FILLED ORDERS
  
  console.log("Seeding filled orders...\n");

  // User1 makes order (get, give)
  transaction = await exchange.connect(user1).makeOrder(token2.address, toWei(1), token1.address, toWei(1));
  result = await transaction.wait();
  console.log(`Make order by: ${user1.address}`);

  // User2 fills order
  orderID = result.events[0].args.id; 
  transaction = await exchange.connect(user2).fillOrder(orderID);
  result = await transaction.wait();
  console.log(`Filler order by: ${user2.address}`);

  await wait(1);

  // User1 makes order (get, give)
  transaction = await exchange.connect(user1).makeOrder(token2.address, toWei(50), token1.address, toWei(15));
  result = await transaction.wait();
  console.log(`Make order by: ${user1.address}`);

  // User2 fills order
  orderID = result.events[0].args.id; 
  transaction = await exchange.connect(user2).fillOrder(orderID);
  result = await transaction.wait();
  console.log(`Filler order by: ${user2.address}`);

  await wait(1);

  // User1 makes order (get, give)
  transaction = await exchange.connect(user1).makeOrder(token2.address, toWei(20), token1.address, toWei(2));
  result = await transaction.wait();
  console.log(`Make order by: ${user1.address}`);

  // User2 fills order
  orderID = result.events[0].args.id; 
  transaction = await exchange.connect(user2).fillOrder(orderID);
  result = await transaction.wait();
  console.log(`Filler order by: ${user2.address}\n`);

  await wait(1);

  //---------------------
  // SEED OPEN ORDERS
  
  // User1 makes 10 orders
  for(let i = 1; i<=10; i++){
    transaction = await exchange.connect(user1).makeOrder(token2.address, toWei(10 * i), token1.address, toWei(10));
    result = await transaction.wait();
    console.log(`Make order by: ${user1.address}`);
  }

  await wait(1);

  // User2 makes 10 orders
  for(let i = 1; i<=10; i++){
    transaction = await exchange.connect(user2).makeOrder(token1.address, toWei(10), token2.address, toWei(10 * i));
    result = await transaction.wait();
    console.log(`Make order by: ${user2.address}`);
  }
*/
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

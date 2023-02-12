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
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

async function main() {
  console.log("\nSEED EXCHANGE\n");

  // Fetch network
  const { chainId } = await ethers.provider.getNetwork();
  console.log("Using chainId: ", chainId);

  // Fetch accounts
  const accounts = await ethers.getSigners();
  console.log(
    `\nAcounts fetched:\n${accounts[0].address}\n${accounts[1].address}\n${accounts[1].address}\n`
  );

  // Fetch deployed tokens
  const token1 = await ethers.getContractAt(
    "Token",
    config[chainId].token1.address
  );
  console.log(`Token1 fetched: ${token1.address}`);

  const token2 = await ethers.getContractAt(
    "Token",
    config[chainId].token2.address
  );
  console.log(`Token2 fetched: ${token2.address}`);

  const token3 = await ethers.getContractAt(
    "Token",
    config[chainId].token3.address
  );
  console.log(`Token3 fetched: ${token3.address}`);

  // Fetch the deployed exchange
  const exchange = await ethers.getContractAt(
    "Exchange",
    config[chainId].exchange.address
  );
  console.log(`Exchange fetched: ${exchange.address}\n`);

  // Set up some users
  const user1 = accounts[0]; // Deployer has initial supply
  const user2 = accounts[1];
  //const user3 = accounts[2]; // Fee acount

  let amount = toWei(500000);

  let transaction, result;

  // -----------------------------------------------------------------------------
  // TRANSFER TOKENS TO USERS (FROM DEPLOYER ACCOUNT)

  console.log("TRANSFER TOKENS TO USERS\n");

  // User1 give token1 to user2
  transaction = await token1.connect(user1).transfer(user2.address, amount);
  result = await transaction.wait();
  //console.log(`Transferred ${toEther(amount)} token1 from ${user1.address} to ${user2.address}`);

  // User1 give token2 to user2
  transaction = await token2.connect(user1).transfer(user2.address, amount);
  result = await transaction.wait();
  //console.log(`Transferred ${toEther(amount)} token2 from ${user1.address} to ${user2.address}\n`);

  result = await token1.connect(user1).getBalanceOf(user1.address);
  console.log(`Initial token1 balance user1: ${toEther(result)}`);
  result = await token2.connect(user1).getBalanceOf(user1.address);
  console.log(`Initial token2 balance user1: ${toEther(result)}`);
  result = await token1.connect(user2).getBalanceOf(user2.address);
  console.log(`Initial token1 balance user2: ${toEther(result)}`);
  result = await token2.connect(user2).getBalanceOf(user2.address);
  console.log(`Initial token2 balance user2: ${toEther(result)}`);
  //result = await token1.connect(user3).getBalanceOf(user3.address);
  //console.log(`Initial token1 balance user3: ${toEther(result)}`);
  //result = await token2.connect(user3).getBalanceOf(user3.address);
  //console.log(`Initial token2 balance user3: ${toEther(result)}\n`);

  // -----------------------------------------------------------------------------
  // TRANSFER TOKENS FROM USERS TO EXCHANGE

  console.log("TRANSFER TOKENS FROM USERS TO EXCHANGE\n");

  // User1 transfer token1 to exchange
  amount = toWei(10000);
  // Approve
  transaction = await token1.connect(user1).approve(exchange.address, amount);
  result = await transaction.wait();
  // Deposit
  transaction = await exchange
    .connect(user1)
    .depositToken(token1.address, amount);
  result = await transaction.wait();
  console.log(`Deposited ${toEther(amount)} token1 from user1 to exchange`);

  // User1 transfer token2 to exchange
  amount = toWei(10000);
  // Approve
  transaction = await token2.connect(user1).approve(exchange.address, amount);
  result = await transaction.wait();
  // Deposit
  transaction = await exchange
    .connect(user1)
    .depositToken(token2.address, amount);
  result = await transaction.wait();
  console.log(`Deposited ${toEther(amount)} token2 from user1 to exchange`);

  // User2 transfer token1 to exchange
  amount = toWei(10000);
  // Approve
  transaction = await token1.connect(user2).approve(exchange.address, amount);
  result = await transaction.wait();
  // Deposit
  transaction = await exchange
    .connect(user2)
    .depositToken(token1.address, amount);
  result = await transaction.wait();
  console.log(`Deposited ${toEther(amount)} token1 from user2 to exchange`);

  // User2 transfer token2 to exchange
  amount = toWei(10000);
  // Approve
  transaction = await token2.connect(user2).approve(exchange.address, amount);
  result = await transaction.wait();
  // Deposit
  transaction = await exchange
    .connect(user2)
    .depositToken(token2.address, amount);
  result = await transaction.wait();
  console.log(`Deposited ${toEther(amount)} token2 from user2 to exchange\n`);

  // Output
  result = await exchange
    .connect(user1)
    .balanceOf(token1.address, user1.address);
  console.log(`User1 token1 balance on exchange: ${toEther(result)}`);
  result = await exchange
    .connect(user1)
    .balanceOf(token2.address, user1.address);
  console.log(`User1 token2 balance on exchange: ${toEther(result)}`);
  result = await exchange
    .connect(user2)
    .balanceOf(token1.address, user2.address);
  console.log(`User2 token1 balance on exchange: ${toEther(result)}`);
  result = await exchange
    .connect(user2)
    .balanceOf(token2.address, user2.address);
  console.log(`User2 token2 balance on exchange: ${toEther(result)}`);
  // result = await exchange
  //   .connect(user3)
  //   .balanceOf(token1.address, user3.address);
  // console.log(`User2 token1 balance on exchange: ${toEther(result)}`);
  // result = await exchange
  //   .connect(user3)
  //   .balanceOf(token2.address, user3.address);
  // console.log(`User2 token2 balance on exchange: ${toEther(result)}\n`);

  result = await token1.connect(user1).getBalanceOf(user1.address);
  console.log(`User1 token1 balance: ${toEther(result)}`);
  result = await token2.connect(user1).getBalanceOf(user1.address);
  console.log(`User1 token2 balance: ${toEther(result)}`);
  result = await token1.connect(user2).getBalanceOf(user2.address);
  console.log(`User2 token1 balance: ${toEther(result)}`);
  result = await token2.connect(user2).getBalanceOf(user2.address);
  console.log(`User2 token2 balance: ${toEther(result)}`);
  // result = await token1.connect(user3).getBalanceOf(user3.address);
  // console.log(`User3 token1 balance: ${toEther(result)}`);
  // result = await token2.connect(user3).getBalanceOf(user3.address);
  // console.log(`User3 token2 balance: ${toEther(result)}\n`);

  // -----------------------------------------------------------------------------
  // SEED CANCELLED ORDERS

  console.log("SEED CANCELLED ORDERS\n");

  // User1 makes order (get, give)
  transaction = await exchange
    .connect(user1)
    .makeOrder(token2.address, toWei(1), token1.address, toWei(1));
  result = await transaction.wait();
  //console.log(`Make order by: ${user1.address}`);

  // User1 cancels order
  orderID = result.events[0].args.id;
  transaction = await exchange.connect(user1).cancelOrder(orderID);
  result = await transaction.wait();
  console.log(`Order ${orderID} cancelled by user1`);

  await wait(1);

  // User1 makes order (get, give)
  transaction = await exchange
    .connect(user2)
    .makeOrder(token2.address, toWei(1), token1.address, toWei(1));
  result = await transaction.wait();
  //console.log(`Make order by: ${user1.address}`);

  // User1 cancels order
  orderID = result.events[0].args.id;
  transaction = await exchange.connect(user2).cancelOrder(orderID);
  result = await transaction.wait();
  console.log(`Order ${orderID} cancelled by user2\n`);

  // -----------------------------------------------------------------------------
  // SEED FILLED ORDERS

  console.log("SEED FILLED ORDERS\n");

  transaction = await exchange
    .connect(user1)
    .makeOrder(token1.address, toWei(100), token2.address, toWei(100));
  result = await transaction.wait();
  orderID = result.events[0].args.id;
  console.log(`Make order ${orderID} by user1`);

  transaction = await exchange.connect(user2).fillOrder(orderID);
  result = await transaction.wait();
  console.log(`Order ${orderID} filled by user2\n`);

  for (let i = 1; i <= 30; i++) {
  let rand1 = Math.floor(Math.random() * 30) + 13;
  let rand2 = Math.floor(Math.random() * 30) + 13;

  // User1 makes 10 sell orders
  transaction = await exchange
    .connect(user1)
    .makeOrder(token2.address, toWei(rand1), token1.address, toWei(rand2));
  result = await transaction.wait();
  orderID = result.events[0].args.id;
  console.log(`Make order ${orderID} by user1`);

  transaction = await exchange.connect(user2).fillOrder(orderID);
  result = await transaction.wait();
  console.log(`Order ${orderID} filled by user2`);
}

await wait(1);

for (let i = 1; i <= 30; i++) {
  let rand1 = Math.floor(Math.random() * 60) + 40;
  let rand2 = Math.floor(Math.random() * 60) + 40;

  // User1 makes 10 sell orders
  transaction = await exchange
    .connect(user1)
    .makeOrder(token1.address, toWei(rand1), token2.address, toWei(rand2));
  result = await transaction.wait();
  orderID = result.events[0].args.id;
  console.log(`Make order ${orderID} by user1`);

  transaction = await exchange.connect(user2).fillOrder(orderID);
  result = await transaction.wait();
  console.log(`Order ${orderID} filled by user2`);
}

await wait(1);

for (let i = 1; i <= 30; i++) {
  let rand1 = Math.floor(Math.random() * 100) + 50;
  let rand2 = Math.floor(Math.random() * 100) + 50;

  // User1 makes 10 sell orders
  transaction = await exchange
    .connect(user1)
    .makeOrder(token2.address, toWei(rand1), token1.address, toWei(rand2));
  result = await transaction.wait();
  orderID = result.events[0].args.id;
  console.log(`Make order ${orderID} by user1`);

  transaction = await exchange.connect(user2).fillOrder(orderID);
  result = await transaction.wait();
  console.log(`Order ${orderID} filled by user2`);
}

await wait(1);

for (let i = 1; i <= 30; i++) {
  let rand1 = Math.floor(Math.random() * 80) + 29;
  let rand2 = Math.floor(Math.random() * 80) + 29;

  // User1 makes 10 sell orders
  transaction = await exchange
    .connect(user1)
    .makeOrder(token1.address, toWei(rand1), token2.address, toWei(rand2));
  result = await transaction.wait();
  orderID = result.events[0].args.id;
  console.log(`Make order ${orderID} by user1`);

  transaction = await exchange.connect(user2).fillOrder(orderID);
  result = await transaction.wait();
  console.log(`Order ${orderID} filled by user2`);
}

await wait(1);

for (let i = 1; i <= 30; i++) {
  let rand1 = Math.floor(Math.random() * 20) + 16;
  let rand2 = Math.floor(Math.random() * 20) + 16;

  // User1 makes 10 sell orders
  transaction = await exchange
    .connect(user1)
    .makeOrder(token2.address, toWei(rand1), token1.address, toWei(rand2));
  result = await transaction.wait();
  orderID = result.events[0].args.id;
  console.log(`Make order ${orderID} by user1`);

  transaction = await exchange.connect(user2).fillOrder(orderID);
  result = await transaction.wait();
  console.log(`Order ${orderID} filled by user2`);
}

await wait(1);

for (let i = 1; i <= 30; i++) {
  let rand1 = Math.floor(Math.random() * 50) + 30;
  let rand2 = Math.floor(Math.random() * 50) + 30;
  // User1 makes 10 sell orders
  transaction = await exchange
    .connect(user1)
    .makeOrder(token1.address, toWei(rand1), token2.address, toWei(rand2));
  result = await transaction.wait();
  orderID = result.events[0].args.id;
  console.log(`Make order ${orderID} by user1`);

  transaction = await exchange.connect(user2).fillOrder(orderID);
  result = await transaction.wait();
  console.log(`Order ${orderID} filled by user2`);
}

  result = await exchange
    .connect(user1)
    .balanceOf(token1.address, user1.address);
  console.log(`\nUser1 token1 balance on exchange: ${toEther(result)}`);
  result = await exchange
    .connect(user1)
    .balanceOf(token2.address, user1.address);
  console.log(`User1 token2 balance on exchange: ${toEther(result)}`);
  result = await exchange
    .connect(user1)
    .balanceOf(token1.address, user2.address);
  console.log(`User2 token1 balance on exchange: ${toEther(result)}`);
  result = await exchange
    .connect(user1)
    .balanceOf(token2.address, user2.address);
  console.log(`User2 token2 balance on exchange: ${toEther(result)}`);
  // result = await exchange
  //   .connect(user3)
  //   .balanceOf(token1.address, user3.address);
  // console.log(`User3 token1 balance on exchange: ${toEther(result)}`);
  // result = await exchange
  //   .connect(user3)
  //   .balanceOf(token2.address, user3.address);
  // console.log(`User3 token2 balance on exchange: ${toEther(result)}\n`);

  // -----------------------------------------------------------------------------
  // SEED OPEN ORDERS

  console.log("SEED OPEN ORDERS\n");

// User1 makes 10 sell orders
for (let i = 1; i <= 20; i++) {
  transaction = await exchange
    .connect(user2)
    .makeOrder(token2.address, toWei(10 * i), token1.address, toWei(10));
  result = await transaction.wait();
  orderID = result.events[0].args.id;
  console.log(`Make order ${orderID} by user2`);
}

// await wait(1);

// User2 makes 10 buy orders
//function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public
for (let i = 1; i <= 20; i++) {
  transaction = await exchange
    .connect(user2)
    .makeOrder(token1.address, toWei(10 * i), token2.address, toWei(10));
  result = await transaction.wait();
  orderID = result.events[0].args.id;
  console.log(`Make order ${orderID} by user2`);
}

result = await exchange.connect(user1).balanceOf(token1.address, user1.address);
console.log(`\nUser1 token1 balance on exchange: ${toEther(result)}`);
result = await exchange.connect(user1).balanceOf(token2.address, user1.address);
console.log(`User1 token2 balance on exchange: ${toEther(result)}`);
result = await exchange.connect(user1).balanceOf(token1.address, user2.address);
console.log(`User2 token1 balance on exchange: ${toEther(result)}`);
result = await exchange.connect(user1).balanceOf(token2.address, user2.address);
console.log(`User2 token2 balance on exchange: ${toEther(result)}`);
// result = await exchange.connect(user3).balanceOf(token1.address, user3.address);
// console.log(`User3 token1 balance on exchange: ${toEther(result)}`);
// result = await exchange.connect(user3).balanceOf(token2.address, user3.address);
// console.log(`User3 token2 balance on exchange: ${toEther(result)}\n`);

result = await token1.connect(user1).getBalanceOf(user1.address);
console.log(`Initial token1 balance user1: ${toEther(result)}`);
result = await token2.connect(user1).getBalanceOf(user1.address);
console.log(`Initial token2 balance user1: ${toEther(result)}`);
result = await token1.connect(user2).getBalanceOf(user2.address);
console.log(`Initial token1 balance user2: ${toEther(result)}`);
result = await token2.connect(user2).getBalanceOf(user2.address);
console.log(`Initial token2 balance user2: ${toEther(result)}`);
// result = await token1.connect(user3).getBalanceOf(user3.address);
// console.log(`Initial token1 balance user3: ${toEther(result)}`);
// result = await token2.connect(user3).getBalanceOf(user3.address);
// console.log(`Initial token2 balance user3: ${toEther(result)}\n`);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

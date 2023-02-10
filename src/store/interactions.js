import { ethers } from "ethers";

import TOKEN_ABI from "../abis/Token.json";
import EXCHANGE_ABI from "../abis/Exchange.json";

export function loadProvider(dispatch) {
    const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({ type: "PROVIDER_LOADED", connection });
    return connection;
}

export async function loadNetwork(provider, dispatch) {
    const { chainId } = await provider.getNetwork();
    dispatch({ type: "NETWORK_LOADED", chainId });
    return chainId;
}

export async function loadAccount(provider, dispatch) {
    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
    });

    const account = ethers.utils.getAddress(accounts[0]);
    dispatch({ type: "ACCOUNT_LOADED", account });
    console.log("Dispatch: account loaded");

    let balance = await provider.getBalance(account);
    balance = ethers.utils.formatEther(balance);
    dispatch({ type: "BALANCE_LOADED", balance });
    console.log("Dispatch: balance loaded");

    return [account, balance];
}

export async function loadTokens(provider, addresses, dispatch) {
    let token, symbol;
    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
    symbol = await token.symbol();
    dispatch({ type: "TOKEN1_LOADED", token, symbol });

    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
    symbol = await token.symbol();
    dispatch({ type: "TOKEN2_LOADED", token, symbol });
    return token;
}

export async function loadExchange(provider, address, dispatch) {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
    dispatch({ type: "EXCHANGE_LOADED", exchange });
    return exchange;
}

export const subscribeToEvents = (exchange, dispatch) => {
    exchange.on(
        "Trade",
        (
            id,
            user,
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            creator,
            timestamp,
            fee,
            event
        ) => {
            const order = event.args;
            dispatch({ type: "ORDER_FILL_SUCCESS", order, event });
            console.log("Dispatch: order filled successfully");
        }
    );

    exchange.on(
        "Cancel",
        (
            id,
            user,
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            timestamp,
            event
        ) => {
            const order = event.args;
            dispatch({ type: "ORDER_CANCEL_SUCCESS", order, event });
            console.log("Dispatch: cancellation successful");
        }
    );

    exchange.on("Deposit", (token, user, amount, balance, event) => {
        dispatch({ type: "TRANSFER_SUCCESS", event });
        console.log("Dispatch: deposit successful");
    });
    exchange.on("Withdrawal", (token, user, amount, balance, event) => {
        dispatch({ type: "TRANSFER_SUCCESS", event });
        console.log("Dispatch: withdrawal successful");
    });
    exchange.on(
        "Order",
        (
            id,
            user,
            tokenGet,
            amountGet,
            tokenGive,
            amountGive,
            timestamp,
            event
        ) => {
            const order = event.args;
            dispatch({ type: "NEW_ORDER_SUCCESS", order, event });
            console.log("Dispatch: new order success");
        }
    );
};

// ------------------------------------------------------------------------------
// LOAD USER BALANCES (WALLET & EXCHANGE)

export async function loadBalances(exchange, tokens, account, dispatch) {
    let balance = ethers.utils.formatUnits(
        await tokens[0].balanceOf(account),
        18
    );
    dispatch({ type: "TOKEN1_BALANCE_LOADED", balance });
    console.log("Dispatch: Token1 balance loaded");

    balance = ethers.utils.formatUnits(await tokens[1].balanceOf(account), 18);
    dispatch({ type: "TOKEN2_BALANCE_LOADED", balance });
    console.log("Dispatch: Token2 balance loaded");

    balance = ethers.utils.formatUnits(
        await exchange.balanceOf(tokens[0].address, account),
        18
    );
    dispatch({ type: "EXCHANGE_TOKEN1_BALANCE_LOADED", balance });
    console.log("Dispatch: Token1 exchange balance loaded");

    balance = ethers.utils.formatUnits(
        await exchange.balanceOf(tokens[1].address, account),
        18
    );
    dispatch({ type: "EXCHANGE_TOKEN2_BALANCE_LOADED", balance });
    console.log("Dispatch: Token2 exchange balance loaded");

    balance = ethers.utils.formatUnits(
        await exchange.balanceOf(
            tokens[0].address,
            "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
        ),
        18
    );
    dispatch({ type: "EXCHANGE_TOKEN1_FEE_BALANCE_LOADED", balance });
    console.log("Dispatch: Token1 exchange balance loaded");

    balance = ethers.utils.formatUnits(
        await exchange.balanceOf(
            tokens[1].address,
            "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
        ),
        18
    );
    dispatch({ type: "EXCHANGE_TOKEN2_FEE_BALANCE_LOADED", balance });
    console.log("Dispatch: Token2 exchange balance loaded");
}

export const loadAllOrders = async (provider, exchange, dispatch) => {
    const block = await provider.getBlockNumber();
    console.log("Current block: " + block);

    // Fetch cancel events (since block zero)
    const cancelStream = await exchange.queryFilter("Cancel", 0, block);
    const cancelledOrders = cancelStream.map((event) => event.args);
    console.log("Dispatch: load cancelled orders");
    dispatch({ type: "CANCELLED_ORDERS_LOADED", cancelledOrders });

    // Fetch trade/filled events (since block zero)
    const filledStream = await exchange.queryFilter("Trade", 0, block);
    const filledOrders = filledStream.map((event) => event.args);
    console.log("Dispatch: load filled orders");
    dispatch({ type: "FILLED_ORDERS_LOADED", filledOrders });

    // Fetch order events (since block zero)
    const orderStream = await exchange.queryFilter("Order", 0, block);
    const allOrders = orderStream.map((event) => event.args);
    console.log("Dispatch: load make orders");
    dispatch({ type: "ALL_ORDERS_LOADED", allOrders });
};

// ------------------------------------------------------------------------------
// TRANSFER TOKENS (DEPOSIT & WITHDRAW)

export const transferTokens = async (
    provider,
    exchange,
    transferType,
    token,
    amount,
    dispatch
) => {
    let transaction;

    dispatch({ type: "TRANSFER_REQUEST" });

    try {
        // Get signer
        const signer = await provider.getSigner();
        // Ether to Wei (BigNumber format)
        const amountToTransfer = ethers.utils.parseUnits(
            amount.toString(),
            "ether"
        );

        // Check if deposit
        if (transferType === "Deposit") {
            // Approve transfer
            transaction = await token
                .connect(signer)
                .approve(exchange.address, amountToTransfer);
            await transaction.wait();
            // Deposit to exchange
            transaction = await exchange
                .connect(signer)
                .depositToken(token.address, amountToTransfer);
            await transaction.wait();
        } else {
            transaction = await exchange
                .connect(signer)
                .withdrawToken(token.address, amountToTransfer);
            await transaction.wait();
        }
    } catch (error) {
        console.error(error);
        dispatch({ type: "TRANSFER_FAIL" });
    }
};

// ------------------------------------------------------------------------------
// ORDERS (BUY & SELL)

export const makeBuyOrder = async (
    provider,
    exchange,
    tokens,
    order,
    dispatch
) => {
    const tokenGet = tokens[0].address;
    const amountGet = ethers.utils.parseUnits(order.amount, "ether");
    const tokenGive = tokens[1].address;
    const amountGive = ethers.utils.parseUnits(
        (order.amount * order.price).toString(),
        "ether"
    );

    console.log("Dispatch: new order request");
    dispatch({ type: "NEW_ORDER_REQUEST" });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange
            .connect(signer)
            .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
        await transaction.wait();
    } catch (error) {
        console.log("Dispatch: new order fail, must be tokens on the exchange");
        dispatch({ type: "NEW_ORDER_FAIL" });
    }
};

export const makeSellOrder = async (
    provider,
    exchange,
    tokens,
    order,
    dispatch
) => {
    const tokenGet = tokens[1].address;
    const amountGet = ethers.utils.parseUnits(
        (order.amount * order.price).toString(),
        "ether"
    );

    const tokenGive = tokens[0].address;
    const amountGive = ethers.utils.parseUnits(order.amount, "ether");

    console.log("Dispatch: new order request");
    dispatch({ type: "NEW_ORDER_REQUEST" });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange
            .connect(signer)
            .makeOrder(tokenGet, amountGet, tokenGive, amountGive);
        await transaction.wait();
    } catch (error) {
        console.log("Dispatch: new order fail, must be tokens on the exchange");
        dispatch({ type: "NEW_ORDER_FAIL" });
    }
};

// ------------------------------------------------------------------------------
// CANCEL ORDER

export const cancelOrder = async (provider, exchange, order, dispatch) => {
    console.log("Dispatch: cancel order request");
    dispatch({ type: "ORDER_CANCEL_REQUEST" });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange
            .connect(signer)
            .cancelOrder(order.id);
        await transaction.wait();
    } catch (error) {
        console.log("Dispatch: cancel order fail");
        dispatch({ type: "ORDER_CANCEL_FAIL" });
    }
};

// ------------------------------------------------------------------------------
// FILL ORDER

export const fillOrder = async (
    provider,
    exchange,
    order,
    dispatch,
    tokens,
    account
) => {
    console.log("Dispatch: fill order request");
    dispatch({ type: "ORDER_FILL_REQUEST" });

    try {
        const signer = await provider.getSigner();
        const transaction = await exchange.connect(signer).fillOrder(order.id);
        await transaction.wait();

        // Reload the wallet and exchange balances to reflect the order
        loadBalances(exchange, tokens, account, dispatch);
    } catch (error) {
        console.log("Dispatch: cancel order fail");
        dispatch({ type: "ORDER_FILL_FAIL" });
    }
};

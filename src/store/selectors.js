import { createSelector } from "reselect";
import { get, groupBy, reject, minBy, maxBy } from "lodash";
import moment from "moment";
import { ethers } from "ethers";

const GREEN = "#25CE8F";
const RED = "#F45353";

const account = (state) => get(state, "provider.account");
const tokens = (state) => get(state, "tokens.contracts");
const events = (state) => get(state, "exchange.events");

const allOrders = (state) => get(state, "exchange.allOrders.data", []); // If not there, return empty array
const cancelledOrders = (state) =>
  get(state, "exchange.cancelledOrders.data", []);
const filledOrders = (state) => get(state, "exchange.filledOrders.data", []);

const openOrders = (state) => {
  const all = allOrders(state);
  const filled = filledOrders(state);
  const cancelled = cancelledOrders(state);

  // Remove filled or cancelled orders
  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some(
      (o) => o.id.toString() === order.id.toString()
    ); // Get true/false order filled
    const orderCancelled = cancelled.some(
      (o) => o.id.toString() === order.id.toString()
    ); // Get true/false cancelled orders
    return orderCancelled || orderFilled; // Return both
  });

  return openOrders;
};

// ------------------------------------------------------------------------------
// MY EVENTS

export const myEventsSelector = createSelector(
  account,
  events,
  (account, events) => {
    events = events.filter((e) => e.args.user === account);
    //console.log(account);
    return events;
  }
);

// ------------------------------------------------------------------------------
// MY FILLED ORDERS

export const myFilledOrdersSelector = createSelector(
  account,
  tokens,
  filledOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    // Find orders relevant to user
    orders = orders.filter((o) => o.maker === account || o.filler === account);
    // Filter orders for current trading pair
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );
    // Sort date descending
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);
    // Decorate orders
    orders = decorateMyFilledOrders(orders, account, tokens);

    return orders;
  }
);

const decorateMyFilledOrders = (orders, account, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateMyFilledOrder(order, account, tokens);
    return order;
  });
};

const decorateMyFilledOrder = (order, account, tokens) => {
  const myOrder = order.maker === account;
  let orderType;
  let fee;
  if (myOrder) {
    orderType = order.tokenGet === tokens[1].address ? "sell" : "buy";
    fee = 0;
  } else {
    orderType = order.tokenGet === tokens[0].address ? "buy" : "sell";
    fee = ethers.utils.formatUnits(order.fee.toString(), "ether");
  }
  return {
    ...order,
    orderType,
    orderClass: orderType === "buy" ? GREEN : RED,
    orderSign: orderType === "buy" ? "+" : "-",
    formattedFee: fee,
  };
};

// ------------------------------------------------------------------------------
// MY OPEN ORDERS

export const myOpenOrdersSelector = createSelector(
  account,
  tokens,
  openOrders,
  (account, tokens, orders) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    // Get account
    orders = orders.filter((o) => o.user === account);

    // Get orders for token1 and token2
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[1].address || o.tokenGive === tokens[0].address
    );

    orders = decorateMyOpenOrders(orders, tokens);

    // Sort order by time descending for UI
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    return orders;
  }
);

const decorateMyOpenOrders = (orders, tokens) => {
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateMyOpenOrder(order, tokens);
    return order;
  });
};

const decorateMyOpenOrder = (order, tokens) => {
  let orderType = order.tokenGive === tokens[1].address ? "buy" : "sell";
  return {
    ...order,
    orderType,
    orderClass: orderType === "buy" ? GREEN : RED,
    orderSign: orderType === "buy" ? "+" : "-",
  };
};

// ------------------------------------------------------------------------------
// ALL FILLED ORDERS

export const filledOrdersSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    // Get orders for token1 and token2
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );

    // Sort order by time ascending
    //orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    // Apply order colors
    orders = decorateFilledOrders(orders, tokens);

    // Sort order by time descending for UI
    orders = orders.sort((a, b) => b.timestamp - a.timestamp);

    return orders;
  }
);

const decorateFilledOrders = (orders, tokens) => {
  //let previousOrder = orders[0];
  return orders.map((order) => {
    order = decorateOrder(order, tokens);
    order = decorateFilledOrder(order, tokens);
    //previousOrder = order;
    return order;
  });
};

const decorateFilledOrder = (order, tokens) => {
  let orderType;
  orderType = order.tokenGet === tokens[1].address ? "sell" : "buy";
  orderType = order.tokenGet === tokens[0].address ? "buy" : "sell";
  return {
    ...order,
    orderType,
    orderClass: orderType === "buy" ? GREEN : RED,
    orderClassOpposite: orderType === "buy" ? RED : GREEN,
    orderSign: orderType === "buy" ? "+" : "-",
    orderSignOpposite: orderType === "buy" ? "-" : "+",
    formattedFee: ethers.utils.formatUnits(order.fee.toString(), "ether"),
  };
};

// ------------------------------------------------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(
  openOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) {
      return;
    }

    // Get orders for token1 and token2
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );

    let tmp = orders.map((order) => {
      order = decorateOrder(order, tokens);
      order = decorateOrderBookOrder(order, tokens);
      return order;
    });

    // Group orders by buy or sell
    orders = groupBy(tmp, "orderType");

    // Fetch buy orders
    const buyOrders = get(orders, "buy", []);

    // Sort buy orders by token price
    orders = {
      ...orders,
      buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
    };

    // Fetch sell orders
    const sellOrders = get(orders, "sell", []);

    // Sort sell orders by token price
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice),
    };

    return orders;
  }
);

const decorateOrder = (order, tokens) => {
  let token0Amount, token1Amount, tokenPrice;

  if (order.tokenGet === tokens[1].address) {
    token0Amount = order.amountGive;
    token1Amount = order.amountGet;
    tokenPrice = token1Amount / token0Amount;
  } else {
    token0Amount = order.amountGet;
    token1Amount = order.amountGive;
    tokenPrice = token1Amount / token0Amount;
  }

  // Calculate token price to 5 decimal places
  const precision = 100000;

  tokenPrice = Math.round(tokenPrice * precision) / precision;

  return {
    ...order,
    //fee: order[6].toString(),
    formattedID: order.id.toString(),
    token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
    token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format("h:mm:ssa MMM D"),
  };
};

const decorateOrderBookOrder = (order, tokens) => {
  const orderType = order.tokenGet === tokens[1].address ? "sell" : "buy";

  return {
    ...order,
    orderType,
    orderTypeClass: orderType === "buy" ? GREEN : RED,
    orderFillAction: orderType === "buy" ? "buy" : "sell",
  };
};

// ------------------------------------------------------------------------------
// PRICE CHART

export const priceChartSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1] || !orders[0] || !orders[1]) {
      return;
    }

    // Get orders concerning token1 and token2
    orders = orders.filter(
      (o) =>
        o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address
    );
    orders = orders.filter(
      (o) =>
        o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address
    );

    // Sort by date ascending
    orders = orders.sort((a, b) => a.timestamp - b.timestamp);

    // Add display attributes
    orders = orders.map((order) => decorateOrder(order, tokens));

    // Get last 2 orders for final price & price change
    let secondLastOrder, lastOrder;
    [secondLastOrder, lastOrder] = orders.slice(
      orders.length - 2,
      orders.length
    );
    const lastPrice = get(lastOrder, "tokenPrice", 0); // Else return zero
    const secondLastPrice = get(secondLastOrder, "tokenPrice", 0); // Else return zero

    return {
      lastPrice,
      lastPriceChange: lastPrice >= secondLastPrice ? "+" : "-",
      series: [
        {
          data: buildGraphData(orders),
        },
      ],
    };
  }
);

const buildGraphData = (orders) => {
  const TIMEWINDOW_SIZE = 60 * 1; // Seconds
  let startTime = orders[0].timestamp;
  let outputTimestamps = [];
  let outputOrders = [];

  for (let i = 0; i < orders.length; i++) {
    let time = orders[i].timestamp;
    let increment = Math.floor((time - startTime) / TIMEWINDOW_SIZE); // how many time increments have passed
    if (!outputTimestamps[increment]) {
      outputTimestamps[increment] = [];
    }
    if (!outputOrders[increment]) {
      outputOrders[increment] = [];
    }
    outputTimestamps[increment].push(moment.unix(orders[i].timestamp).format());
    //console.log(i,' ',increment)
    outputOrders[increment].push(orders[i]);
  }

  let newTimestamps = [];
  let newOrders = [];
  let count = 0;

  // Remove any arrays that are undefined (due to increment index)
  for (let i = 0; i < outputTimestamps.length; i++) {
    if (typeof outputTimestamps[i] !== "undefined") {
      newTimestamps[count] = outputTimestamps[i];
      newOrders[count] = outputOrders[i];
      count++;
    }
  }

  // Dynamically populate object holding orders grouped by time window label
  var data = {};
  for (let i = 0; i < newTimestamps.length; i++) {
    data[`${newTimestamps[i][0]}`] = newOrders[i];
  }
  orders = data;

  // orders = groupBy(
  //   orders,
  //   (o) => moment.unix(o.timestamp).startOf("minutes").format() // set to minutes - zero out secs, ms (so they can be grouped by minutes)
  // );
  //console.log(orders);

  // Get each time window label
  const hours = Object.keys(orders);
  //console.log(hours)
  // Iterate over each time window
  const graphData = hours.map((hour) => {
    // Get order for each size of time window
    const group = orders[hour];
    // Get open, high, low, close
    const open = group[0];
    const high = maxBy(group, "tokenPrice");
    const low = minBy(group, "tokenPrice");
    const close = group[group.length - 1];
    return {
      x: new Date(hour),
      y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice],
    };
  });

  return graphData;
};

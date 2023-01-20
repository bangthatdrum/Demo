import { createSelector } from 'reselect'
import { get, groupBy, reject, minBy, maxBy } from 'lodash';
import moment from 'moment'
import { ethers } from 'ethers';

const GREEN = '#25CE8F'
const RED = '#F45353'

const tokens = state => get(state, 'tokens.contracts')
const allOrders = state => get(state, 'exchange.allOrders.data', []) // If not there, return empty array
const cancelledOrders = state => get(state, 'exchange.cancelledOrders.data', [])
const filledOrders = state => get(state, 'exchange.filledOrders.data', [])

const openOrders = state => {
  const all = allOrders(state)
  const filled = filledOrders(state)
  const cancelled = cancelledOrders(state)

  // Remove filled or cancelled orders 
  const openOrders = reject(all, (order) => {
    const orderFilled = filled.some((o) => o.id.toString() === order.id.toString()) // Get true/false order filled
    const orderCancelled = cancelled.some((o) => o.id.toString() === order.id.toString()) // Get true/false cancelled orders
    return(orderCancelled || orderFilled) // Return both
  })

  return openOrders
}

const decorateOrder = (order, tokens) => {
  let token0Amount, token1Amount, tokenPrice

  if (order.tokenGet === tokens[1].address) {
    token0Amount = order.amountGive 
    token1Amount = order.amountGet   
    tokenPrice = (token0Amount / token1Amount)

  } else {
    token0Amount = order.amountGet
    token1Amount = order.amountGive
    tokenPrice = (token1Amount / token0Amount)
  }

  // Calculate token price to 5 decimal places
  const precision = 100000

  tokenPrice = Math.round(tokenPrice * precision) / precision

  return ({
    ...order,
    token0Amount: ethers.utils.formatUnits(token0Amount, "ether"),
    token1Amount: ethers.utils.formatUnits(token1Amount, "ether"),
    tokenPrice,
    formattedTimestamp: moment.unix(order.timestamp).format('h:mm:ssa d MMM D')
  })
}

const decorateOrderBookOrder = (order, tokens) => {
  const orderType = order.tokenGet === tokens[1].address ? 'sell' : 'buy'

  return({
    ...order,
    orderType,
    orderTypeClass: (orderType === 'buy' ? GREEN : RED),
    orderFillAction: (orderType === 'buy' ? 'sell' : 'buy')
  })
}

// ------------------------------------------------------------------------------
// ORDER BOOK

export const orderBookSelector = createSelector(
  openOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }

    // Get orders for token1 and token2
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    let tmp = orders.map((order) => {
      order = decorateOrder(order, tokens)
      order = decorateOrderBookOrder(order, tokens)
      return(order)
    })

    // Group orders by buy or sell
    orders = groupBy(tmp, 'orderType')

    // Fetch buy orders
    const buyOrders = get(orders, 'buy', [])

    // Sort buy orders by token price
    orders = {
        ...orders,
        buyOrders: buyOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    // Fetch sell orders
    const sellOrders = get(orders, 'sell', [])

    // Sort sell orders by token price
    orders = {
      ...orders,
      sellOrders: sellOrders.sort((a, b) => b.tokenPrice - a.tokenPrice)
    }

    return orders
  }
)

// ------------------------------------------------------------------------------
// PRICE CHART

export const priceChartSelector = createSelector(
  filledOrders,
  tokens,
  (orders, tokens) => {
    if (!tokens[0] || !tokens[1]) { return }

    // Get orders concerning token1 and token2
    orders = orders.filter((o) => o.tokenGet === tokens[0].address || o.tokenGet === tokens[1].address)
    orders = orders.filter((o) => o.tokenGive === tokens[0].address || o.tokenGive === tokens[1].address)

    // Sort by date ascending
    orders = orders.sort((a,b) => a.timestamp - b.timestamp)

    // Add display attributes
    orders = orders.map((order) => decorateOrder(order, tokens))
    //orders.map((order) => console.log(order.formattedTimestamp))

    // Get last 2 orders for final price & price change
    let secondLastOrder, lastOrder
    [secondLastOrder, lastOrder] = orders.slice(orders.length -2, orders.length)
    const lastPrice = get(lastOrder, 'tokenPrice', 0) // Else return zero
    const secondLastPrice = get(secondLastOrder, 'tokenPrice', 0) // Else return zero
    console.log(secondLastPrice)
    console.log(lastPrice)
    return({
        lastPrice,
        lastPriceChange: (lastPrice >= secondLastPrice ? '+' : '-'),
        series: [{
        data: buildGraphData(orders)
      }]
    })    

  }
  )

const buildGraphData = (orders) => {  
    // Group orders by each time window (seconds, minutes, or hours etc)
    orders = groupBy(orders, (o) => moment.unix(o.timestamp).startOf('minute').format())
    //console.log(orders)

    // Get each time window label
    const hours = Object.keys(orders) 
    console.log(hours)
    
    // Iterate over each time window
    const graphData = hours.map((hour) => {
      // Get order for each size of time window
      const group = orders[hour]

      // Get open, high, low, close
      const open = group[0]
      const high = maxBy(group, 'tokenPrice')
      const low = minBy(group, 'tokenPrice')
      const close = group[group.length - 1]

      return({
        x: new Date(hour),
        y: [open.tokenPrice, high.tokenPrice, low.tokenPrice, close.tokenPrice]
      })
    })

  return graphData
  
}
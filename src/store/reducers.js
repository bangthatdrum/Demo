// ---------------------------------------------------------
// PROVIDER

export const provider = (state = {}, action) => {
  switch(action.type) {
    case 'PROVIDER_LOADED':
      return {
        ...state,
        connection: action.connection
      }
    case 'NETWORK_LOADED':
      return {
        ...state,
        chainId: action.chainId
      }
    case 'ACCOUNT_LOADED':
      return {
        ...state,
        account: action.account
      }
    case 'BALANCE_LOADED':
      return {
        ...state,
        balance: action.balance
      }
    default:
      return state
  }
}

// ---------------------------------------------------------
// TOKENS

const DEFAULT_TOKENS_STATE = {
  loaded:false, 
  contracts:[], 
  symbols:[]
}

export const tokens = (state = DEFAULT_TOKENS_STATE, action) => {
  switch(action.type) {
    case 'TOKEN1_LOADED':
      return {
        ...state,
        loaded:true,
        contracts:[action.token],
        symbols:[action.symbol]
        }
    case 'TOKEN2_LOADED':
      return {
        ...state,
        loaded:true,
        contracts:[...state.contracts, action.token],
        symbols:[...state.symbols, action.symbol]
        }
    case 'TOKEN1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance]
      }
    case 'TOKEN2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance]
      }
    default:
      return state
  }
}

// ---------------------------------------------------------
// EXCHANGE

const DEFAULT_EXCHANGE_STATE = {
  loaded: false,
  contract: {},
  balances: {},
  transaction: {
    transactionType: '',
    isPending: false,
    isSuccessful: false,
    isError: false
  },
  transferInProgress: false,
  allOrders: [],
  events: []
}

export const exchange = (state = DEFAULT_EXCHANGE_STATE, action) => {
  switch(action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        loaded: true,
        contract: action.exchange // No brackets!
      }

      // Balance cases

      case 'EXCHANGE_TOKEN1_BALANCE_LOADED':
      return {
        ...state,
        balances: [action.balance]
      }
      case 'EXCHANGE_TOKEN2_BALANCE_LOADED':
      return {
        ...state,
        balances: [...state.balances, action.balance]
      }

      // Transfer cases (deposits & withdrawls)
    
      case 'TRANSFER_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: true,
          isSuccessful: false
        },
        transferInProgress: true
      }
     case 'TRANSFER_SUCCESS':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: true
        },
        transferInProgress: false,
        events: [...state.events, action.event]
      }
      case 'TRANSFER_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'Transfer',
          isPending: false,
          isSuccessful: false,
          isError: true
        },
        transferInProgress: false,
        events: [...state.events, action.event]
      }

      // Making new orders 

      case 'NEW_ORDER_REQUEST':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: true,
          isSuccessful: false
        },
      }

      case 'NEW_ORDER_SUCCESS':
      return {
        ...state, 
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: true
        },
        allOrders: [...state.allOrders, action.order],
        events: [...state.events, action.event]
      }

      case 'NEW_ORDER_FAIL':
      return {
        ...state,
        transaction: {
          transactionType: 'New Order',
          isPending: false,
          isSuccessful: false,
          isError: true
        },
      }

    default:
      return state
  }
}


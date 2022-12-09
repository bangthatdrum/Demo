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
        chaidId: action.chainId
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
      return state;
  }
}

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
        contracts:[...state.contracts, action.token],
        symbol:[...state.symbols, action.symbol]
        }
     case 'TOKEN2_LOADED':
      return {
        ...state,
        loaded:true,
        contracts:[...state.contracts, action.token],
        symbol:[...state.symbols, action.symbol]
        }
    default:
      return state;
  }
}

export const exchange = (state = {loaded:false, constract:{}}, action) => {
  switch(action.type) {
    case 'EXCHANGE_LOADED':
      return {
        ...state,
        connection: action.exchange
      }
    default:
      return state;
  }
}

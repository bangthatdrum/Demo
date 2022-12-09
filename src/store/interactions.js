import {ethers} from 'ethers';
import TOKEN_ABI from '../abis/Token.json';
import EXCHANGE_ABI from '../abis/Exchange.json';

export function loadProvider(dispatch) {
	const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({type: 'PROVIDER_LOADED', connection});
    return connection;
}

export async function loadNetwork(provider, dispatch) {
    const {chainId} = await provider.getNetwork();
    dispatch({type: 'NETWORK_LOADED', chainId});
    return chainId;
}

export async function loadAccount(provider, dispatch) {
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    const account = ethers.utils.getAddress(accounts[0]);
    dispatch({type: 'ACCOUNT_LOADED', account});

    let balance = await provider.getBalance(account);
    balance = ethers.utils.formatEther(balance);
    
    dispatch({type: 'BALANCE_LOADED', balance});

    return [account, balance];
}

export async function loadTokens(provider, addresses, dispatch) {
    let token, symbol;
    token = new ethers.Contract(addresses[0], TOKEN_ABI, provider);
    symbol = await token.symbol();
    dispatch({type: 'TOKEN1_LOADED', token, symbol});
    token = new ethers.Contract(addresses[1], TOKEN_ABI, provider);
    symbol = await token.symbol();
    dispatch({type: 'TOKEN2_LOADED', token, symbol});
    return token;
}

export async function loadExchange(provider, address, dispatch) {
    const exchange = new ethers.Contract(address, EXCHANGE_ABI, provider);
    dispatch({type: 'EXCHANGE_LOADED', exchange});
    return exchange
}
import {ethers} from 'ethers';

export const loadProvider = (dispatch) => {
	const connection = new ethers.providers.Web3Provider(window.ethereum);
    dispatch({type: 'PROVIDER_LOADED', connection});

    return connection;
}
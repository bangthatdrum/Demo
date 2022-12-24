import {useEffect} from 'react';
import {useDispatch} from 'react-redux';

import config from '../config.json';

import Navbar from './Navbar';

import {
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens,
  loadExchange
} from '../store/interactions';

function App() {
  const dispatch = useDispatch();

  const loadBlockchainData = async () => {
    // Connect Ethers to blockchain
    const provider = loadProvider(dispatch);

    // Fetch network chaidId (e.g. hardhat: 31337, etc)
    const chainId = await loadNetwork(provider, dispatch);
    console.log("ChainId: ", chainId);
    
    // Reload page when network change
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    })

    // Fetch current account & balance from Metamask when changed
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch);
      console.log('account changed');
    });

    //const accountDetails = await loadAccount(provider, dispatch);
    //console.log("Account: ", accountDetails[0]);
   
    // Token smart contract
    // const token1 = config[chainId].token1;
    // const token2 = config[chainId].token2;
    // await loadTokens(provider,[token1.address, token2.address] , dispatch);
    
    // // Load exchange smart contract
    // const exchange = config[chainId].exchange;
    // await loadExchange(provider, exchange.address, dispatch);
  }

  useEffect(() => {
      loadBlockchainData();
  })

  return (
    <div>

      <Navbar/>

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
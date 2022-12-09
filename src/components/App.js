import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {ethers} from 'ethers';

import config from '../config.json';

import {
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadTokens,
  loadExchange
} from '../store/interactions';

function App() {
  const dispatch = useDispatch();

  async function loadBlockchainData() {
    // Connect Ethers to blockchain
    const provider = loadProvider(dispatch);

    // Fetch network chaidId   
    const chainId = await loadNetwork(provider, dispatch);
    console.log("ChainId: ", chainId);
    
    // Fetch current account & balance from Metamask
    const accountDetails = await loadAccount(provider, dispatch);
    console.log("Account: ", accountDetails[0]);
   
    // Token smart contract
    const token1 = config[chainId].token1;
    const token2 = config[chainId].token2;
    await loadTokens(provider,[token1.address, token2.address] , dispatch);
    
    // Load exchange smart contract
    const exchange = config[chainId].exchange;
    await loadExchange(provider, exchange.address, dispatch);
  }

  useEffect(() => {
      loadBlockchainData();
  })

  return (
    <div>

      {/* Navbar */}

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
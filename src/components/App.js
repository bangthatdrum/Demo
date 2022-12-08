import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {ethers} from 'ethers';

import config from '../config.json';

import {
  loadProvider, 
  loadNetwork, 
  loadAccount,
  loadToken
} from '../store/interactions';

function App() {
  const dispatch = useDispatch();

  async function loadBlockchainData() {
    // Connect Ethers to blockchain
    const provider = loadProvider(dispatch);
    // Get details
    const chainId = await loadNetwork(provider, dispatch);
    const account = await loadAccount(dispatch);
    console.log("ChainId: ", chainId);
    console.log("Account: ", account);

    // const {chainId} = await provider.getNetwork();
    // console.log("Chain Id: ", config[chainId].token1.address);
    
    // Token smart contract
    //const token = new ethers.Contract(config[chainId].token1.address, TOKEN1_ABI, provider)
    // console.log("Token address: ", token.address);
    // const symbol = await token.symbol();
    // console.log("Token symbol: ", symbol);
    
    await loadToken(provider,config[chainId].token1.address,dispatch);

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
import { useSelector, useDispatch} from 'react-redux'

import config from '../config.json';

import { loadTokens } from '../store/interactions';

const Markets = () => {
  const dispatch = useDispatch();
  const chainId = useSelector(state => state.provider.chainId)
  const provider = useSelector(state => state.provider.connection)

  const marketHandler = async (event) => {
    const addresses = (event.target.value).split(',');
    await loadTokens(provider, addresses, dispatch);
  }

  return(
    <div className='component exchange__markets'>
      <div className='component__header'>
        <h2>Select Market</h2>
      </div>

      {chainId && config[chainId] ? (
        <select name="markets" id="markets" onChange={marketHandler}>
          <option value={`${config[chainId].token1.address},${config[chainId].token2.address}`}>Token1 / Token2</option>
          <option value={`${config[chainId].token1.address},${config[chainId].token3.address}`}>Token1 / Token3</option>
        </select>
      ) : (
        <div>Not deployed to network</div>
      )}

     
      <hr/>
    </div>
  )
}

export default Markets;
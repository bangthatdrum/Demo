import { useState, useRef } from 'react'
import { useSelector, useDispatch} from 'react-redux'
import { makeBuyOrder, makeSellOrder } from '../store/interactions'

const Order = () => {
  const dispatch = useDispatch()  
  const provider = useSelector(state => state.provider.connection)
  const exchange = useSelector(state => state.exchange.contract)
  const tokens = useSelector(state => state.tokens.contracts)

  const [isBuy, setIsBuy] = useState(true)

  const [amount, setAmount] = useState(0)
  const [price, setPrice] = useState(0)

  const buyRef = useRef(null)
  const sellRef = useRef(null)

  const buyHandler = (event) => {
    event.preventDefault()
    let order = {amount, price}
    makeBuyOrder(provider, exchange, tokens, order, dispatch)
    setAmount(0)
    setPrice(0)
  }

  const sellHandler = (event) => {
    event.preventDefault()
    let order = {amount, price}
    makeSellOrder(provider, exchange, tokens, order, dispatch)
    setAmount(0)
    setPrice(0)
  }

  const tabHandler = (event) => {
    if(event.target.id === 'buy') {
      buyRef.current.className = 'tab tab--active'
      sellRef.current.className = 'tab'
      setIsBuy(true)
    } 
    if(event.target.id === 'sell') {
      buyRef.current.className = 'tab'
      sellRef.current.className = 'tab tab--active'
      setIsBuy(false)
    }  
  }
  
  return (
    <div className="component exchange__orders">
      <div className='component__header flex-between'>
        <h2>Exchange</h2>
        <div className='tabs'>
          <button onClick={tabHandler} ref={buyRef} id='buy' className='tab tab--active'>Buy</button>
          <button onClick={tabHandler} ref={sellRef} id='sell' className='tab'>Sell</button>
        </div>
      </div>

      {
        isBuy 
        ? 
        (<label htmlFor="amount">Token1 Amount</label>)
        :
        (<label htmlFor="amount">Token1 Amount</label>)
      }

      <form onSubmit={ isBuy ? buyHandler : sellHandler }>
        <input 
          type="text" 
          id='amount' 
          placeholder='0.0000'
          value={amount === 0 ? '' : amount} 
          onChange={(event) => setAmount(event.target.value)}
        />
        
      {
        isBuy 
        ? 
        (<label htmlFor="price">Price Per Unit</label>)
        :
        (<label htmlFor="price">Price Per Unit</label>)
      }

        <input 
          type="text" 
          id='price' 
          placeholder='0.0000' 
          value={price === 0 ? '' : price} 
          onChange={(event) => setPrice(event.target.value)}
        />

        <button className='button button--filled' type='submit'>
        {isBuy 
          ? (<span>Buy Order</span>)
          : (<span>Sell Order</span>)}
        </button>

      </form>
    </div>
  );
}

export default Order
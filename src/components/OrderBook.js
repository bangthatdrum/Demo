import { useSelector, useDispatch} from 'react-redux'

// Import Assets
import sort from '../assets/sort.svg'

// Import Selectors
import { orderBookSelector } from '../store/selectors'

const OrderBook = () => {
  const symbols = useSelector(state => state.tokens.symbols)
  const orderBook = useSelector(orderBookSelector)

  return (
    <div className="component exchange__orderbook">

      <div className='component__header flex-between'>
        <h2>Order Book</h2>
      </div>

      <div className="flex">

        {!orderBook || orderBook.sellOrders.length === 0 
        ?
        (<p className='flex-center'>No Sell Orders</p>)
        : 
        (<table className='exchange__orderbook--sell'> 
          <caption>Selling (Exchange token 1 for token 2)</caption>
          
          {/* COLUMN TITLES */} 
          <thead> 
            <tr>
              <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
              <th>{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
              <th>Price<img src={sort} alt="Sort" /></th>
            </tr>
          </thead>

          {/* ORDER BOOK */} 
          <tbody> 
            {orderBook && orderBook.sellOrders.map((order, index) => {
              return(         
              <tr key={index}>
                <td>{order.token0Amount}</td>               
                <td>{order.token1Amount}</td> 
                <td style={{ color: `${order.orderTypeClass}` }}>{order.tokenPrice}</td>
              </tr>
              )
            })}
          </tbody>
        </table>)}

        <div className='divider'></div>

        {!orderBook || orderBook.sellOrders.length === 0 
        ? 
        (<p className='flex-center'>No Buy Orders</p>) 
        : 
        (<table className='exchange__orderbook--buy'> 
          <caption>Buying (Exchange token 2 for token 1)</caption>

          {/* COLUMN TITLES */} 
          <thead>
            <tr>
              <th>{symbols && symbols[1]}<img src={sort} alt="Sort" /></th>
              <th>{symbols && symbols[0]}<img src={sort} alt="Sort" /></th>
              <th>Price<img src={sort} alt="Sort" /></th>
            </tr>
          </thead>

          {/* ORDER BOOK */} 
          <tbody>
            {orderBook && orderBook.buyOrders.map((order, index) => {
              return(         
              <tr key={index}>
                <td>{order.token1Amount}</td>             
                <td>{order.token0Amount}</td>
                <td style={{ color: `${order.orderTypeClass}` }}>{order.tokenPrice}</td>
              </tr>
              )
            })}
          </tbody>
        </table>)}

      </div>

    </div>
  );
}

export default OrderBook;
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

import dapp from "../assets/dapp.svg";
import eth from "../assets/eth.svg";

import { loadBalances, transferTokens } from "../store/interactions";

const Balance = () => {
  const [isDeposit, setIsDeposit] = useState(true);
  const [token1TransferAmount, setToken1TransferAmount] = useState(0);
  const [token2TransferAmount, setToken2TransferAmount] = useState(0);

  const dispatch = useDispatch();

  const provider = useSelector((state) => state.provider.connection);
  const account = useSelector((state) => state.provider.account);

  const exchange = useSelector((state) => state.exchange.contract);
  const exchangeBalances = useSelector((state) => state.exchange.balances);

  const transferInProgress = useSelector(
    (state) => state.exchange.transferInProgress
  );

  const tokens = useSelector((state) => state.tokens.contracts);
  const symbols = useSelector((state) => state.tokens.symbols);
  const tokenBalances = useSelector((state) => state.tokens.balances);

  const depositRef = useRef(null);
  const withdrawRef = useRef(null);

  const tabHandler = (event) => {
    if (event.target.id === "deposit") {
      depositRef.current.className = "tab tab--active";
      withdrawRef.current.className = "tab";
      setIsDeposit(true);
    }
    if (event.target.id === "withdraw") {
      depositRef.current.className = "tab";
      withdrawRef.current.className = "tab tab--active";
      setIsDeposit(false);
    }
  };

  const depositHandler = (event, token) => {
    event.preventDefault(); // Override default action (reload page)
    if (token.address === tokens[0].address) {
      transferTokens(
        provider,
        exchange,
        "Deposit",
        token,
        token1TransferAmount,
        dispatch
      );
      setToken1TransferAmount(0);
    } else {
      transferTokens(
        provider,
        exchange,
        "Deposit",
        token,
        token2TransferAmount,
        dispatch
      );
      setToken2TransferAmount(0);
    }
  };

  const withdrawHandler = (event, token) => {
    event.preventDefault(); // Override default action (reload page)
    if (token.address === tokens[0].address) {
      transferTokens(
        provider,
        exchange,
        "Withdraw",
        token,
        token1TransferAmount,
        dispatch
      );
      setToken1TransferAmount(0);
    } else {
      transferTokens(
        provider,
        exchange,
        "Withdraw",
        token,
        token2TransferAmount,
        dispatch
      );
      setToken2TransferAmount(0);
    }
  };

  useEffect(() => {
    if (exchange && tokens[0] && tokens[1] && account) {
      loadBalances(exchange, tokens, account, dispatch);
    }
  }, [exchange, tokens, account, transferInProgress, dispatch]); // If change trigger whole thing again!

  return (
    <div className="component exchange__transfers">
      <div className="component__header flex-between">
        <h2>Balance</h2>
        <div className="tabs">
          <button
            onClick={tabHandler}
            ref={depositRef}
            id="deposit"
            className="tab tab--active"
          >
            Deposit
          </button>
          <button
            onClick={tabHandler}
            ref={withdrawRef}
            id="withdraw"
            className="tab"
          >
            Withdraw
          </button>
        </div>
      </div>

      {/* Deposit/Withdraw (token1) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>Token1</small>
            <br />
            <img src={dapp} alt="Token1 logo" />
            {symbols && symbols[0]}
          </p>
          <p>
            <small>Wallet1</small>
            <br />
            {tokenBalances && tokenBalances[0]}
          </p>
          <p>
            <small>Exchange</small>
            <br />
            {exchangeBalances && exchangeBalances[0]}
          </p>
        </div>

        <form
          onSubmit={
            isDeposit
              ? (event) => depositHandler(event, tokens[0])
              : (event) => withdrawHandler(event, tokens[0])
          }
        >
          <label htmlFor="token0">{symbols && symbols[0]} Amount</label>
          <input
            type="text"
            id="token0"
            placeholder="0.0000"
            value={token1TransferAmount === 0 ? "" : token1TransferAmount}
            onChange={(event) => setToken1TransferAmount(event.target.value)}
          />

          <button className="button" type="submit">
            {account ? (
              isDeposit ? (
                <span>Deposit</span>
              ) : (
                <span>Withdraw</span>
              )
            ) : isDeposit ? (
              <span>Sign in to Deposit</span>
            ) : (
              <span>Sign in to Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />

      {/* Deposit/Withdraw Component 2 (token2) */}

      <div className="exchange__transfers--form">
        <div className="flex-between">
          <p>
            <small>Token</small>
            <br />
            <img src={eth} alt="Token2 logo" />
            {symbols && symbols[1]}
          </p>
          <p>
            <small>Wallet</small>
            <br />
            {tokenBalances && tokenBalances[1]}
          </p>
          <p>
            <small>Exchange</small>
            <br />
            {exchangeBalances && exchangeBalances[1]}
          </p>
        </div>

        <form
          onSubmit={
            isDeposit
              ? (event) => depositHandler(event, tokens[1])
              : (event) => withdrawHandler(event, tokens[1])
          }
        >
          <label htmlFor="token1">{symbols && symbols[1]} Amount</label>
          <input
            type="text"
            id="token1"
            placeholder="0.0000"
            value={token2TransferAmount === 0 ? "" : token2TransferAmount}
            onChange={(event) => setToken2TransferAmount(event.target.value)}
          />

          <button className="button" type="submit">
            {account ? (
              isDeposit ? (
                <span>Deposit</span>
              ) : (
                <span>Withdraw</span>
              )
            ) : isDeposit ? (
              <span>Sign in to Deposit</span>
            ) : (
              <span>Sign in to Withdraw</span>
            )}
          </button>
        </form>
      </div>

      <hr />
    </div>
  );
};

export default Balance;

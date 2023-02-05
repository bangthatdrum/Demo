import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { myEventsSelector } from "../store/selectors";

import config from "../config.json";

const Alert = () => {
  const alertRef = useRef(null);

  const network = useSelector((state) => state.provider.network);
  const isPending = useSelector(
    (state) => state.exchange.transaction.isPending
  );
  const isError = useSelector((state) => state.exchange.transaction.isError);
  const account = useSelector((state) => state.provider.account);
  const events = useSelector(myEventsSelector);

  const removeHandler = async (e) => {
    alertRef.current.className = "alert--remove";
  };

  useEffect(() => {
    if ((isPending || isError) && (events[0] && account)) {
      alertRef.current.className = "alert";
    }
  }, [events, isPending, isError, account]);

  return (
    <div>
      {isPending ? (
        <div className="alert--remove" onClick={removeHandler} ref={alertRef}>
          <h1>Transaction Pending...</h1>
        </div>
      ) : isError ? (
        <div className="alert--remove" onClick={removeHandler} ref={alertRef}>
          <h1>Transaction Will Fail</h1>
        </div>
      ) : events[0] ? (
        <div className="alert--remove" onClick={removeHandler} ref={alertRef}>
          <h1>Transaction Successful</h1>
          <a
            href={
              config[network]
                ? `${config[network].explorerURL}/tx/${events[0].transactionHash}`
                : "#"
            }
            target="_blank"
            rel="noreferrer"
          >
            {events[0].transactionHash.slice(0, 6) +
              "..." +
              events[0].transactionHash.slice(60, 66)}
          </a>
        </div>
      ) : (
        <div>Else error</div>
      )}
    </div>
  );
};

export default Alert;

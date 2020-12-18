/* IMPORTS */
// Config
import React from "react";
// Components
import { defaults } from "lib/const";
import "./style.css";

export default ({ availableTokens, paymentToken, paymentRequested, handleChanges }) => {
  return (
    <div className="section">
          <label
            className={
              paymentToken === "0x0"
                ? "sectionLabel emptyAddress"
                : "sectionLabel"
            }
          >
            Payment requested
          </label>
          <select
            className="input"
            name="paymentToken"
            placeholder=" Tribute token"
            value={paymentToken}
            onChange={handleChanges}
          >
            <option value={defaults.EMPTY} disabled>
              Select payment token
            </option>
            {availableTokens.map((t, i) => (
              <option key={i} value={t.tokenAddress}>
                {t.symbol}
              </option>
            ))}
          </select>
          <input
            className="input number"
            type="number"
            name="paymentRequested"
            placeholder="Payment requested"
            value={paymentRequested}
            onChange={handleChanges}
          />
    </div>
  )
}
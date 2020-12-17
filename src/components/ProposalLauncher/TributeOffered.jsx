/* IMPORTS */
// Config
import React from "react";
// Components
import { defaults } from "lib/const";
import "./style.css";

export default ({ availableTokens, tributeToken, tributeOffered, handleChanges }) => {
  return (
    <div className="section">
          <label
            className={
              tributeToken === "0x0"
                ? "sectionLabel emptyAddress"
                : "sectionLabel"
            }
          >
            Tribute offered
          </label>
          <select
            className="input"
            name="tributeToken"
            placeholder=" Tribute token"
            value={tributeToken}
            onChange={handleChanges}
          >
            <option value={defaults.EMPTY} disabled>
              Select tribute token
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
            name="tributeOffered"
            placeholder=" Tribute offered"
            value={tributeOffered}
            onChange={handleChanges}
          />
    </div>
  )
}
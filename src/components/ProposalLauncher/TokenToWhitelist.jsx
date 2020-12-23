/* IMPORTS */
// Config
import React from "react";
// Components
import { defaults } from "lib/const";
import "./style.css";

export default ({ tokenToWhitelist, ERC20Tokens, handleChanges }) => {
  return (
    <div className="section">
          <label className={`sectionLabel ${tokenToWhitelist === "0x0" ? 'invalidAddress' : null}`}>
          Token to withelist
          </label>
          <select
            id="full"
            className="input"
            name="tokenToWhitelist"
            value={tokenToWhitelist}
            onChange={handleChanges}
          >
            <option value={defaults.EMPTY} disabled>
              Select token
            </option>
            {ERC20Tokens.map((t, i) => (
              <option key={i} value={t.address}>
                {t.symbol}
              </option>
            ))}
          </select>
    </div>
  )
}
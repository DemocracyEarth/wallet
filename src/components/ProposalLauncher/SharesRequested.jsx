/* IMPORTS */
// Config
import React from "react";
// Components
import "./style.css";

export default ({ sharesRequested, lootRequested, handleChanges }) => {
  return (
    <div className="requestsContainer">
        <div className="section requests">
        <label className="sectionLabel">Shares requested</label>
        <input
            className="input"
            type="number"
            name="sharesRequested"
            value={sharesRequested}
            onChange={handleChanges}
        />
        </div>
        <div className="section requests">
        <label className="sectionLabel">Loot requested</label>
        <input
            className="input"
            type="number"
            name="lootRequested"
            value={lootRequested}
            onChange={handleChanges}
        />
        </div>
  </div>
  )
}
/* IMPORTS */
// Config
import React from "react";
// Components
import "./style.css";

export default ({ memberToKick, handleChanges }) => {
  return (
    <div className="section">
          <label className="sectionLabel">
            Member
            {memberToKick.validated
              ? <span className="validAddress"> -validated address</span>
              : <span className="invalidAddress"> -invalid address</span>}
          </label>
          <input
            className="input"
            type="text"
            name="memberToKick"
            value={memberToKick.address}
            onChange={handleChanges}
          />
    </div>
  )
}
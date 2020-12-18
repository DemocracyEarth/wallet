/* IMPORTS */
// Config
import React from "react";
// Components
import "./style.css";

export default ({ applicant, handleChanges }) => {
  return (
    <div className="section">
          <label className="sectionLabel">
            Applicant
            {applicant.validated
              ? <span className="validAddress"> -validated address</span>
              : <span className="invalidAddress"> -invalid address</span>}
          </label>
          <input
            className="input"
            type="text"
            name="applicant"
            value={applicant.address}
            onChange={handleChanges}
          />
    </div>
  )
}
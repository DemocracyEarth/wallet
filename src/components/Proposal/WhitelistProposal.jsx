/* IMPORTS */
// Config
import React from "react";

// Components
import { defaults } from "lib/const";
import { Loader } from "rimble-ui";
import "./modalStyle.css";

export default (props) => {
  return (
    <div>
      <div className="title">
        <h2>Whitelist Proposal</h2>
      </div>
      <form action="" className="form">
        <div className="section">
          <label>Applicant</label>
          <input
            className="input"
            type="text"
            name="applicant"
            value={props.state.applicant}
            onChange={props.handleChanges}
          />
        </div>
        <div className="section">
          <label>Title</label>
          <input
            className="input"
            type="text"
            name="title"
            value={props.state.title}
            onChange={props.handleChanges}
          />
        </div>
        <div className="section">
          <label>Description</label>
          <textarea
            className="input"
            type="text textarea"
            name="description"
            value={props.state.description}
            onChange={props.handleChanges}
          />
        </div>
        <div className="section">
          <label>Link</label>
          <input
            className="input"
            type="text"
            name="link"
            value={props.state.link}
            onChange={props.handleChanges}
          />
        </div>
        <div className="section">
          <label>Token to be withelisted</label>
          <select
            className="input"
            name="paymentToken"
            value={props.state.paymentToken}
            onChange={props.handleChanges}
          >
            <option value={defaults.EMPTY} disabled>
              Select payment token
            </option>
            {props.state.allTokens.map((t, i) => (
              <option key={i} value={t.address}>

                {t.symbol}
              </option>
            ))}
          </select>
        </div>
        <div className="section end">
          {props.state.isLoading ? (
            <Loader size="30px" />
          ) : (
            <div className="submit" onClick={props.handleSubmit}>
              <button>Submit proposal</button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

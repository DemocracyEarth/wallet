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
        <h2>Full Proposal</h2>
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
        <div className="requestsContainer">
          <div className="section requests">
            <label>Shares requested</label>
            <input
              className="input"
              type="number"
              name="sharesRequested"
              value={props.state.sharesRequested}
              onChange={props.handleChanges}
            />
          </div>
          <div className="section requests">
            <label>Loot requested</label>
            <input
              className="input"
              type="number"
              name="lootRequested"
              value={props.state.lootRequested}
              onChange={props.handleChanges}
            />
          </div>
        </div>
        <div className="section">
          <label>Tribute offered</label>
          <select
            className="input"
            name="tributeToken"
            placeholder=" Tribute token"
            value={props.state.tributeToken}
            onChange={props.handleChanges}
          >
            <option value={defaults.EMPTY} disabled>
              Select tribute token
            </option>
            {props.state.availableTokens.map((t, i) => (
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
            value={props.state.tributeOffered}
            onChange={props.handleChanges}
          />
        </div>
        <div className="section">
          <label>Payment requested</label>
          <select
            className="input"
            name="paymentToken"
            placeholder=" Tribute token"
            value={props.state.paymentToken}
            onChange={props.handleChanges}
          >
            <option value={defaults.EMPTY} disabled>
              Select payment token
            </option>
            {props.state.availableTokens.map((t, i) => (
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
            value={props.state.paymentRequested}
            onChange={props.handleChanges}
          />
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

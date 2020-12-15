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
          <label className="sectionLabel">Applicant</label>
          <input
            className="input"
            type="text"
            name="applicant"
            value={props.state.applicant.address}
            onChange={props.handleChanges}
          />
        </div>
        <div className="section">
          <label className="sectionLabel">Title</label>
          <input
            className="input"
            type="text"
            name="title"
            value={props.state.title}
            onChange={props.handleChanges}
          />
        </div>
        <div className="section">
          <label className="sectionLabel">Description</label>
          <textarea
            className="input"
            type="text textarea"
            name="description"
            value={props.state.description}
            onChange={props.handleChanges}
          />
        </div>
        <div className="section">
          <label className="sectionLabel">Link</label>
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
            <label className="sectionLabel">Shares requested</label>
            <input
              className="input"
              type="number"
              name="sharesRequested"
              value={props.state.sharesRequested}
              onChange={props.handleChanges}
            />
          </div>
          <div className="section requests">
            <label className="sectionLabel">Loot requested</label>
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
          <label
            className={
              props.state.tributeToken === "0x0"
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
          <label
            className={
              props.state.paymentToken === "0x0"
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
          <button className="submit clear" onClick={props.resetState}>
            Clear
          </button>
          {props.state.isLoading ? (
            <Loader size="30px" />
          ) : (
            <button disabled={false} className="submit" onClick={props.handleSubmit}>
              Submit proposal
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

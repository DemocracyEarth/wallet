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
        <h2>Guildkick Proposal</h2>
      </div>
      <form action="" className="form">
        <div className="section">
          <label>Member to kick:</label>
          <input
            className="input"
            type="text"
            name="memberToKick"
            value={props.state.memberToKick}
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

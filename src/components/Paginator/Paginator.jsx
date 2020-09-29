import React, { Component } from 'react';
import { css } from "@emotion/core";
import BeatLoader from "react-spinners/BeatLoader";

// Can be a string as well. Need to ensure each key-value pair ends with ;
const override = css`
  margin: 0 auto;
  border-color: var(--menu-sidebar-selected);
  display: inline-block;
`;

export default class Paginator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  render() {
    return (
      <div className="spinner-loading">
        <BeatLoader
          css={override}
          size={15}
          margin={2}
          color={'var(--menu-sidebar-selected)'}
          loading={this.state.loading}
        />
      </div>
    );
  }
}

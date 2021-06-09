import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Emoji from "react-emoji-render";

import 'styles/Dapp.css';

/**
* @summary renders a post in the timeline
*/
export default class Title extends Component {
  static propTypes = {
    label: PropTypes.string,
  }

  render() {
    return (
      <div className="dapp-title">
        <Emoji text={this.props.label} />
      </div>
    );
  }
}

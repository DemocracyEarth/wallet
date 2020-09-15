import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Emoji from "react-emoji-render";

import 'styles/Dapp.css';

/**
* @summary renders a post in the timeline
*/
export default class Flag extends Component {
  static propTypes = {
    styleClass: PropTypes.string,
    label: PropTypes.string,
  }

  render() {
    return (
      <div>
        <div className="warning-list animate">
          <div className={this.props.styleClass}>
            <Emoji text={this.props.label} />
          </div>
        </div>
      </div>
    );
  }
}

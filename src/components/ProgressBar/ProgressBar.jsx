import React, { Component } from 'react';
import PropTypes from 'prop-types';

import 'styles/Dapp.css';
const numeral = require('numeral');

/**
* @summary renders a post in the timeline
*/
export default class ProgressBar extends Component {
  static propTypes = {
    percentage: PropTypes.string,
  }


  getlabelClass() {
    if (Number(this.props.percentage) < 10) {
      return 'poll-score-percentage poll-score-small';
    }
    return 'poll-score-percentage';
  }

  render() {
    return (
      <div className="progress-bar">
        <div className="poll-score poll-score-button">
          <div className="poll-score-bar">
            <div className="poll-score-bar-fill" style={{ width: `${this.props.percentage}%` }} />
          </div>
          <div className={this.getlabelClass()}>
            {`${numeral(this.props.percentage).format('0.00')}%`}
          </div>
        </div>
      </div>
    );
  }
}

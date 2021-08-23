
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';

import { timeComplete, timeCompressed, hourOnly, timeSince, countdown, createDateQuery } from 'utils/chronos';
import 'styles/Dapp.css';

const _dateURL = (timestamp) => {
  const from = new Date(parseInt(Number(timestamp) * 1000, 10));
  const fromQuery = createDateQuery(from);
  return `/date/${fromQuery}`;
};

/**
* @summary displays the timestamp of a given post or event
*/
export default class Stamp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: this.props.link ? this.props.link : _dateURL(this.props.timestamp),
      label: this.getFormattedLabel(this.props.format),
      fullDate: this.getFormattedLabel(),
    };
  }

  getFormattedLabel(format) {
    const date = new Date(parseInt(Number(this.props.timestamp) * 1000, 10));

    switch (format) {
      case 'timeCompressed':
        return timeCompressed(date);
      case 'hourOnly':
        return hourOnly(date);
      case 'timeSince':
        return timeSince(date);
      case 'countdown':
        return countdown(date);
      default:
    }
    if (window.innerWidth < 768) {
      return timeSince(date);
    }
    return timeComplete(date);
  }

  render() {
    return (
      <div className="date-info">
        <a href={this.state.url} target="_blank" rel="noopener noreferrer" title={this.state.fullDate.replace(/&#183;/g, '·')} className="verifier verifier-live verifier-feed" onClick={(e) => { e.stopPropagation(); }}>
          {parser(this.state.label)}
        </a>
      </div>
    );
  }
}

Stamp.propTypes = {
  timestamp: PropTypes.string,
  format: PropTypes.string,
  link: PropTypes.string,
};

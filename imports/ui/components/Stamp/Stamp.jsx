import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';

import { createDateQuery } from '/imports/ui/templates/widgets/transaction/transaction';
import { timeComplete, timeCompressed, hourOnly, timeSince, countdown } from '/imports/ui/modules/chronos';

const _dateURL = (timestamp) => {
  const from = new Date(parseInt(timestamp.toNumber() * 1000, 10));
  const fromQuery = createDateQuery(from);
  const until = new Date(parseInt((timestamp.toNumber() * 1000) + (60 * 60 * 24 * 1000), 10));
  const untilQuery = createDateQuery(until);
  return `/date?from=${fromQuery}&until=${untilQuery}`;
};

/**
* @summary displays the timestamp of a given post or event
*/
export default class Stamp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      url: _dateURL(this.props.timestamp),
      label: this.getFormattedLabel(this.props.format),
      fullDate: this.getFormattedLabel(),
    };
  }

  getFormattedLabel(format) {
    const date = new Date(parseInt(this.props.timestamp.toNumber() * 1000, 10));

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
    return timeComplete(date);
  }

  render() {
    return (
      <div className="date-info">
        <a href={this.state.url} title={this.state.fullDate} className="verifier verifier-live verifier-feed">
          {parser(this.state.label)}
        </a>
      </div>
    );
  }
}

Stamp.propTypes = {
  timestamp: PropTypes.string,
  format: PropTypes.string,
};

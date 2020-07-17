import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';

/**
* @summary renders a post in the timeline
*/
export default class Period extends Component {
  constructor(props) {
    super(props);

    this.state = {
      now: _.findWhere(Session.get('blockTimes'), { collectiveId: 'ETH' }).timestamp,
      beginning: new Date(parseInt(this.props.votingPeriodBegins.toNumber() * 1000, 10)).getTime(),
      end: new Date(parseInt(this.props.votingPeriodEnds.toNumber() * 1000, 10)).getTime(),
      graceEnd: new Date(parseInt(this.props.gracePeriodEnds.toNumber() * 1000, 10)).getTime(),
    };
  }

  getStyle() {
    if (this.state.now > this.state.graceEnd) {
      return `warning period period-${this.props.status.toLowerCase()}`;
    } else if (this.state.now > this.state.end) {
      return 'warning period period-grace';
    } else if (this.state.now > this.state.beginning) {
      return 'warning period period-voting';
    }
    return 'warning period period-queue';
  }

  getLabel() {
    if (this.state.now > this.state.graceEnd) {
      return TAPi18n.__(`moloch-period-${this.props.status.toLowerCase()}`);
    } else if (this.state.now > this.state.end) {
      return TAPi18n.__('moloch-period-grace');
    } else if (this.state.now > this.state.beginning) {
      return TAPi18n.__('moloch-period-voting');
    }
    return TAPi18n.__('moloch-period-queue');
  }

  render() {
    return (
      <div>
        <div className="warning-list animate">
          <div className={this.getStyle()}>
            {this.getLabel()}
          </div>
        </div>
      </div>
    );
  }
}

Period.propTypes = {
  votingPeriodBegins: PropTypes.string,
  votingPeriodEnds: PropTypes.string,
  gracePeriodEnds: PropTypes.string,
  status: PropTypes.string,
};

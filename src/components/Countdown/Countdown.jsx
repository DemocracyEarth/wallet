import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18n';

import calendar from 'images/calendar.svg';
import vote from 'images/vote.png';
import 'styles/Dapp.css';

/**
* @summary renders a post in the timeline
*/
export default class Countdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      beginning: new Date(parseInt(Number(this.props.votingPeriodBegins) * 1000, 10)).getTime(),
      end: new Date(parseInt(Number(this.props.votingPeriodEnds) * 1000, 10)).getTime(),
      graceEnd: new Date(parseInt(Number(this.props.gracePeriodEnds) * 1000, 10)).getTime(),
    };
  }

  getVotersLabel() {
    const voters = Number(this.props.totalVoters);
    if (voters === 1) {
      return `${this.props.totalVoters} ${i18n.t('voter').toLowerCase()}`;
    } else if (voters === 0) {
      return i18n.t('no-voters');
    }
    return `${this.props.totalVoters} ${i18n.t('voters').toLowerCase()}`;
  }

  getPollLabel() {
    let delta;
    let label;

    if (this.props.now > this.state.graceEnd) {
      delta = parseInt(this.props.now - this.state.end, 10);
      label = 'poll-ended-days-ago';
    } else if (this.props.now > this.state.end) {
      delta = parseInt(this.state.graceEnd - this.props.now, 10);
      label = 'countdown-grace';
    } else if (this.props.now > this.state.beginning) {
      delta = parseInt(this.state.end - this.props.now, 10);
      label = 'countdown-expiration';
    } else {
      delta = parseInt(this.state.beginning - this.props.now, 10);
      label = 'countdown-queue';
    }

    const days = Math.floor(delta / 1000 / 86400);
    const hours = Math.floor(delta / 1000 / 3600) % 24;
    return i18n.t(label, { 
      days: `${days} ${days > 1 ? i18n.t('days-compressed') : i18n.t('days-singular')}`,
      hours: `${hours} ${hours > 1 ? i18n.t('hours-compressed') : i18n.t('hours-singular')}`
    });
  }

  getWidth() {
    let electionLength;
    let electionNow;

    if (this.props.now > this.state.graceEnd) {
      return '0%';
    } else if (this.props.now > this.state.end) {
      electionLength = parseInt(this.state.graceEnd - this.state.end, 10);
      electionNow = parseInt(this.props.now - this.state.end, 10);
    } else if (this.props.now > this.state.beginning) {
      electionLength = parseInt(this.state.end - this.state.beginning, 10);
      electionNow = parseInt(this.props.now - this.state.beginning, 10);
    } else {
      return '0%';
    }
    const percentage = parseInt((electionNow * 100) / electionLength, 10);
    return `${percentage}%`;
  }

  getStyle() {
    let colorClass;
    if ((this.props.now > this.state.end) && (this.props.now <= this.state.graceEnd)) {
      colorClass = 'countdown-timer-grace';
    } else if ((this.props.now > this.state.beginning) && (this.props.now <= this.state.end)) {
      colorClass = 'countdown-timer-voting';
    } else if (this.props.now < this.state.beginning) {
      colorClass = 'countdown-timer-queue';
    }
    return `countdown-timer ${colorClass}`;
  }

  render() {
    return (
      <div className="countdown">
        <div className="countdown-label countdown-votes">
          <img className="url-icon icon-up2" alt="" src={vote} /> {this.getVotersLabel()}
        </div>
        <div id="timer" className="countdown-label">
          <img className="url-icon icon-up2" alt="" src={calendar} /> {this.getPollLabel()}
        </div>
        <div className="countdown-timer-bar">
          <div className={this.getStyle()} style={{ width: this.getWidth() }} />
        </div>
      </div>
    );
  }
}

Countdown.propTypes = {
  now: PropTypes.number,
  totalVoters: PropTypes.string,
  votingPeriodBegins: PropTypes.string,
  votingPeriodEnds: PropTypes.string,
  gracePeriodEnds: PropTypes.string,
};

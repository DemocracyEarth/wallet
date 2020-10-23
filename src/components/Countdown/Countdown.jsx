import React, { Component } from 'react';
import PropTypes from 'prop-types';
import i18n from 'i18n';

import calendar from 'images/calendar.svg';
import 'styles/Dapp.css';

const _getDayExpression = (days) => {
  if (days === 0) {
    return '';
  }
  if (days > 1) {
    return `${days} ${i18n.t('days-compressed')}`;
  }
  return `${days} ${i18n.t('days-singular')}`;
}

/**
* @summary renders a post in the timeline
*/
export default class Countdown extends Component {
  static propTypes = {
    now: PropTypes.number,
    totalVoters: PropTypes.string,
    votingPeriodBegins: PropTypes.string,
    votingPeriodEnds: PropTypes.string,
    gracePeriodEnds: PropTypes.string
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

    if (this.props.now > this.props.gracePeriodEnds) {
      delta = parseInt(this.props.now - this.props.votingPeriodEnds, 10);
      label = 'poll-ended-days-ago';
    } else if (this.props.now > this.props.votingPeriodEnds) {
      delta = parseInt(this.props.gracePeriodEnds - this.props.now, 10);
      label = 'countdown-grace';
    } else if (this.props.now > this.props.votingPeriodBegins) {
      delta = parseInt(this.props.votingPeriodEnds - this.props.now, 10);
      label = 'countdown-expiration';
    } else {
      delta = parseInt(this.props.votingPeriodBegins - this.props.now, 10);
      label = 'countdown-queue';
    }

    const days = Math.floor(delta / 86400);
    const hours = Math.floor(delta / 3600) % 24;
    return i18n.t(label, { 
      days: _getDayExpression(days),
      hours: `${hours} ${hours > 1 ? i18n.t('hours-compressed') : i18n.t('hours-singular')}`
    });
  }

  getWidth() {
    let electionLength;
    let electionNow;

    if (this.props.now > this.props.gracePeriodEnds) {
      return '0%';
    } 
    
    if (this.props.now > this.props.votingPeriodEnds) {
      electionLength = parseInt(this.props.gracePeriodEnds - this.props.votingPeriodEnds, 10);
      electionNow = parseInt(this.props.now - this.props.votingPeriodEnds, 10);
    } else if (this.props.now > this.props.votingPeriodBegins) {
      electionLength = parseInt(this.props.votingPeriodEnds - this.props.votingPeriodBegins, 10);
      electionNow = parseInt(this.props.now - this.props.votingPeriodBegins, 10);
    } else {
      return '0%';
    }

    const percentage = parseInt(100 - ((electionNow * 100) / electionLength), 10);
    return `${percentage}%`;
  }

  getStyle() {
    let colorClass;
    if ((this.props.now > this.props.votingPeriodEnds) && (this.props.now <= this.props.gracePeriodEnds)) {
      colorClass = 'countdown-timer-grace';
    } else if ((this.props.now > this.props.votingPeriodBegins) && (this.props.now <= this.props.votingPeriodEnds)) {
      colorClass = 'countdown-timer-voting';
    } else if (this.props.now < this.props.votingPeriodBegins) {
      colorClass = 'countdown-timer-queue';
    }
    return `countdown-timer ${colorClass}`;
  }

  render() {
    return (
      <div className="countdown">
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

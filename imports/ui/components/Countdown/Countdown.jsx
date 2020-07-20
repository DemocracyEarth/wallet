import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TAPi18n } from 'meteor/tap:i18n';

import { getTemplateImage } from '/imports/ui/templates/layout/templater.js';

/**
* @summary renders a post in the timeline
*/
export default class Countdown extends Component {
  constructor(props) {
    super(props);

    this.state = {
      icon: {
        vote: '',
        calendar: '',
      },
      beginning: new Date(parseInt(this.props.votingPeriodBegins.toNumber() * 1000, 10)).getTime(),
      end: new Date(parseInt(this.props.votingPeriodEnds.toNumber() * 1000, 10)).getTime(),
      graceEnd: new Date(parseInt(this.props.gracePeriodEnds.toNumber() * 1000, 10)).getTime(),
    };
  }

  async componentDidMount() {
    await this.setIcons();
  }

  async setIcons() {
    this.setState({
      icon: {
        vote: await getTemplateImage('vote-icon-black'),
        calendar: await getTemplateImage('calendar'),
      },
    });
  }

  getVotersLabel() {
    const voters = this.props.totalVoters.toNumber();
    if (voters === 1) {
      return `${this.props.totalVoters} ${TAPi18n.__('voter').toLowerCase()}`;
    } else if (voters === 0) {
      return TAPi18n.__('no-voters');
    }
    return `${this.props.totalVoters} ${TAPi18n.__('voters').toLowerCase()}`;
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
    return TAPi18n.__(label)
      .replace('{{days}}', `${days} ${days > 1 ? TAPi18n.__('days-compressed') : TAPi18n.__('days-singular')}`)
      .replace('{{hours}}', `${hours} ${hours > 1 ? TAPi18n.__('hours-compressed') : TAPi18n.__('hours-singular')}`);
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
          <img className="url-icon icon-up2" role="presentation" src={this.state.icon.vote} /> {this.getVotersLabel()}
        </div>
        <div id="timer" className="countdown-label">
          <img className="url-icon icon-up2" role="presentation" src={this.state.icon.calendar} /> {this.getPollLabel()}
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

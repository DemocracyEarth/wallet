import React, { Component } from 'react';
import PropTypes from 'prop-types';
import parser from 'html-react-parser';
import { TAPi18n } from 'meteor/tap:i18n';


/**
* @summary percentage of time already transcurred for this decision
* @param {number} remainingBlocks until dedadline
* @param {number} height final block
* @param {boolean} alwaysOn if on always
* @param {boolean} editorMode if editor
* @return {string} with countdown sentence
*/
const _getDeadline = (now, remainingBlocks, length, height, alwaysOn, editorMode, periodDuration, period) => {
  let countdown = TAPi18n.__('countdown-expiration');
  let count = remainingBlocks;

  switch (period) {
    case 'QUEUE':
    case 'GRACE':
    case 'PROCESS':
      countdown = TAPi18n.__(`countdown-${period.toLowerCase()}`);
      break;
    default:
      if (editorMode) {
        if (!alwaysOn) {
          countdown = TAPi18n.__('poll-hypothetical');
        } else {
          countdown = TAPi18n.__('poll-never-ends');
        }
      } else if (alwaysOn) {
        countdown = TAPi18n.__('poll-never-ends');
      } else if (height <= now) {
        countdown = TAPi18n.__('poll-closed-after-time');
        count = length;
      }
  }

  // get total seconds between the times
  let delta;
  if (!periodDuration) {
    delta = parseInt(count * blocktimes.ETHEREUM_SECONDS_PER_BLOCK, 10);
  } else {
    delta = parseInt(count * (periodDuration / 1000), 10);
  }

  // calculate (and subtract) whole days
  const days = Math.floor(delta / 86400);
  delta -= days * 86400;

  // calculate (and subtract) whole hours
  const hours = Math.floor(delta / 3600) % 24;
  delta -= hours * 3600;

  // calculate (and subtract) whole minutes
  const minutes = Math.floor(delta / 60) % 60;
  delta -= minutes * 60;

  // what's left is seconds
  const seconds = delta % 60;


  if (days > 0) {
    countdown = countdown.replace('{{days}}', `${days} ${days > 1 ? TAPi18n.__('days-compressed') : TAPi18n.__('days-singular')}`);
  } else {
    countdown = countdown.replace('{{days}}', '');
  }
  if (hours > 0) {
    countdown = countdown.replace('{{hours}}', `${hours} ${hours > 1 ? TAPi18n.__('hours-compressed') : TAPi18n.__('hours-singular')}`);
  } else {
    countdown = countdown.replace('{{hours}}', '');
  }
  if (minutes > 0) {
    countdown = countdown.replace('{{minutes}}', `${minutes} ${minutes > 1 ? TAPi18n.__('minutes-compressed') : TAPi18n.__('minutes-singular')}`);
  } else {
    countdown = countdown.replace('{{minutes}}', '');
  }
  if (seconds > 0) {
    countdown = countdown.replace('{{seconds}}', `${seconds} ${seconds > 1 ? TAPi18n.__('seconds-compressed') : TAPi18n.__('seconds-singular')}`);
  } else {
    countdown = countdown.replace('{{seconds}}', '');
  }

  if (height) {
    countdown = countdown.replace('{{height}}', `${height.toLocaleString(undefined, [{ style: 'decimal' }])}`);
  }

  countdown = countdown.replace('{{blocks}}', `${remainingBlocks.toLocaleString(undefined, [{ style: 'decimal' }])} ${remainingBlocks > 1 ? TAPi18n.__('periods-compressed') : TAPi18n.__('periods-singular')}`);

  return `${countdown}`;
};

/**
* @summary calculates remaining time based on chain rules
* @param {number} now current time in blockchain clock
* @param {object} data the information for this poll
*/
const _getRemaining = (now, data) => {
  let confirmed;
  let delta;
  let closing;
  switch (data.period) {
    case 'QUEUE':
      confirmed = parseInt(data.delta - 1, 10);
      break;
    case 'GRACE':
      delta = parseInt(((data.graceCalendar.getTime() - data.timestamp.getTime()) / (data.periodDuration)) - data.delta, 10);
      closing = parseInt(data.height + delta, 10);
      confirmed = parseInt(delta - (closing - now), 10);
      break;
    default:
      confirmed = parseInt(data.delta - (data.height - now), 10);
  }
  return parseInt(data.delta - confirmed, 10);
};

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
      width: '50%',
    };
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
    return '';
    const now = Template.instance().now.get();
    const remaining = _getRemaining(now, this);
    if (isNaN(remaining)) {
      return TAPi18n.__('syncing');
    }
    const deadline = _getDeadline(now, remaining, this.delta, this.height, this.alwaysOn, this.editorMode, this.periodDuration, this.period);
    return deadline;
  }

  render() {
    return (
      <div className="countdown">
        <div className="countdown-label countdown-votes">
          <img className="url-icon icon-up2" role="presentation" src={this.state.icon.vote} />
          {this.getVotersLabel()}
        </div>
        <div id="timer" className="countdown-label">
          <img className="url-icon icon-up2" role="presentation" src={this.state.icon.calendar} />
          {this.getPollLabel()}
        </div>
        <div className="countdown-timer-bar">
          <div className="countdown-timer" style={{ width: this.state.width }} />
        </div>
      </div>
    );
  }
}

Countdown.propTypes = {
  totalVoters: PropTypes.string,
  votingPeriodBegins: PropTypes.string,
  votingPeriodEnds: PropTypes.string,
  gracePeriodEnds: PropTypes.string,
}

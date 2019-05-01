import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { getBlockHeight } from '/imports/startup/both/modules/metamask.js';
import { blocktimes } from '/lib/const';

import '/imports/ui/templates/components/decision/countdown/countdown.html';


/**
* @summary returns if effectively the poll is within a valid date
* @param {number} now current block
* @param {object} contract being analysed
* @return {boolean} true or fase
*/
const _isPollOpen = (now, contract) => {
  if (contract && contract.rules.alwaysOn) {
    return true;
  }
  if (contract && contract.closing && contract.rules) {
    return (now < contract.closing.height);
  }
  return true;
};

/**
* @summary percentage of time already transcurred for this decision
* @param {number} currentBlock now
* @param {number} delta length
* @param {number} finalBlock end

* @return {number} percentage in float
*/
const _getPercentage = (currentBlock, delta, finalBlock) => {
  if (finalBlock <= currentBlock) {
    return 0;
  }
  const initialBlock = parseInt(finalBlock - delta, 10);
  const confirmedBlocks = parseInt(currentBlock - initialBlock, 10);
  const percentage = parseFloat((confirmedBlocks * 100) / delta);

  return parseFloat(100 - percentage, 10);
};

/**
* @summary percentage of time already transcurred for this decision
* @param {number} remainingBlocks until dedadline
* @param {number} height final block
* @param {boolean} alwaysOn if on always
* @param {boolean} editorMode if editor
* @return {string} with countdown sentence
*/
const _getDeadline = (now, remainingBlocks, length, height, alwaysOn, editorMode) => {
  let countdown = TAPi18n.__('countdown-expiration');
  let count = remainingBlocks;

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

  // get total seconds between the times
  let delta = parseInt(count * blocktimes.ETHEREUM_SECONDS_PER_BLOCK, 10);

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

  countdown = countdown.replace('{{blocks}}', `${remainingBlocks.toLocaleString(undefined, [{ style: 'decimal' }])} ${remainingBlocks > 1 ? TAPi18n.__('blocks-compressed') : TAPi18n.__('blocks-singular')}`);

  return `${countdown}`;
};


/**
* @summary determines deadline status based on current blockheight
* @param {object} instance where to write last block number
*/
const _currentBlock = async (instance) => {
  const now = await getBlockHeight().then((resolved) => { instance.now.set(resolved); });
  return now;
};

Template.countdown.onCreated(function () {
  Template.instance().now = new ReactiveVar();
  _currentBlock(Template.instance());
});

Template.countdown.helpers({
  label() {
    const now = Template.instance().now.get();
    const confirmed = parseInt(this.delta - (this.height - now), 10);
    const deadline = _getDeadline(now, parseInt(this.delta - confirmed, 10), this.delta, this.height, this.alwaysOn, this.editorMode);
    return deadline;
  },
  timerStyle() {
    return `width: ${_getPercentage(Template.instance().now.get(), this.delta, this.height)}%`;
  },
  alertMode() {
    const percentage = _getPercentage(Template.instance().now.get(), this.delta, this.height);

    if (percentage && percentage < 25) {
      return 'countdown-timer-final';
    } else if (percentage && percentage < 5) {
      return 'countdown-timer-final';
    }
    return '';
  },
});

export const currentBlock = _currentBlock;
export const isPollOpen = _isPollOpen;

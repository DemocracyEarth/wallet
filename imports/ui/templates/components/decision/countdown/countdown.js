import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { getBlockHeight } from '/imports/startup/both/modules/metamask.js';
import { blocktimes } from '/lib/const';

import '/imports/ui/templates/components/decision/countdown/countdown.html';


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
* @return {string} with countdown sentence
*/
const _getDeadline = (remainingBlocks, length) => {
  let countdown = TAPi18n.__('countdown-expiration');
  let count = remainingBlocks;

  if (remainingBlocks <= 0) {
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

  countdown = countdown.replace('{{blocks}}', `${remainingBlocks.toLocaleString(undefined, [{ style: 'decimal' }])} ${remainingBlocks > 1 ? TAPi18n.__('blocks-compressed') : TAPi18n.__('blocks-singular')}`);

  return `${countdown}`;
};

Template.countdown.onCreated(function () {
  Template.instance().currentBlock = new ReactiveVar();
  Template.instance().confirmedBlocks = new ReactiveVar();
});

Template.countdown.onRendered(async function () {
  const instance = Template.instance();
  const now = await getBlockHeight();
  const init = parseInt(this.data.height - this.data.delta, 10);

  instance.currentBlock.set(now);
  instance.confirmedBlocks.set(parseInt(now - init, 10));
});

Template.countdown.helpers({
  label() {
    const confirmed = Template.instance().confirmedBlocks.get();
    return _getDeadline(parseInt(this.delta - confirmed, 10), this.delta);
  },
  timerStyle() {
    return `width: ${_getPercentage(Template.instance().currentBlock.get(), this.delta, this.height)}%`;
  },
  alertMode() {
    const percentage = _getPercentage(Template.instance().currentBlock.get(), this.delta, this.height);

    if (percentage && percentage < 25) {
      return 'countdown-timer-final';
    } else if (percentage && percentage < 5) {
      return 'countdown-timer-final';
    }
    return '';
  },
});

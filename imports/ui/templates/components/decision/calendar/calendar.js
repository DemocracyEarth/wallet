import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { animatePopup } from '/imports/ui/modules/popup';

import { blocktimes } from '/lib/const';
import { getBlockHeight } from '/imports/startup/both/modules/metamask.js';

import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';

import '/imports/ui/templates/components/decision/calendar/calendar.html';
import '/imports/ui/templates/widgets/switcher/switcher.js';

/**
* @summary sets the block time configuration for closing in cached contract
* @param {number} blocks length in blockchain
*/
const _setBlockTime = async (blocks) => {
  const cache = Session.get('cachedDraft');
  cache.closing.delta = blocks;
  cache.closing.height = await getBlockHeight() + blocks;
  cache.closing.calendar = new Date();

  Session.set('cachedDraft', cache);
};

Template.calendar.onRendered(function () {
  Session.set('cachedDraft', Session.get('draftContract'));
});

Template.calendar.helpers({
  alwaysOn() {
    return (Session.get('cachedDraft') && Session.get('cachedDraft').rules) ? Session.get('cachedDraft').rules.alwaysOn : false;
  },
  timers() {
    return {
      selected: 0,
      option: [
        {
          value: false,
          label: 'blockchain-time-daily',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_DAY);
          },
        },
        {
          value: false,
          label: 'blockchain-time-weekly',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_WEEK);
          },
        },
        {
          value: false,
          label: 'blockchain-time-monthly',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_MONTH);
          },
        },
        {
          value: false,
          label: 'blockchain-time-quarterly',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_QUARTER);
          },
        },
        {
          value: false,
          label: 'blockchain-time-annual',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_YEAR);
          },
        },
      ],
    };
  },
});

Template.calendar.events({
  'click #cancel-calendar'() {
    animatePopup(false, 'calendar-popup');
    Session.set('showClosingEditor', false);
  },
});

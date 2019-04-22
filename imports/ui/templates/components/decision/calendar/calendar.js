import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { animatePopup } from '/imports/ui/modules/popup';

import { blocktimes } from '/lib/const';
import { token } from '/lib/token';
import { getBlockHeight } from '/imports/startup/both/modules/metamask.js';

import { TAPi18n } from 'meteor/tap:i18n';

import '/imports/ui/templates/components/decision/calendar/calendar.html';
import '/imports/ui/templates/widgets/switcher/switcher.js';

/**
* @summary sets the block time configuration for closing in cached contract
* @param {number} blocks length in blockchain
*/
const _setBlockTime = async (blocks) => {
  const cache = Session.get('cachedDraft');
  const blockHeight = await getBlockHeight();
  let days = 0;

  if (blockHeight) {
    cache.closing.delta = blocks;
    cache.closing.height = blockHeight + blocks;

    switch (blocks) {
      case blocktimes.ETHEREUM_DAY:
        days = 1;
        break;
      case blocktimes.ETHEREUM_WEEK:
        days = 7;
        break;
      case blocktimes.ETHEREUM_MONTH:
        days = 30;
        break;
      case blocktimes.ETHEREUM_QUARTER:
        days = 90;
        break;
      case blocktimes.ETHEREUM_YEAR:
      default:
        days = 365;
    }
    const today = new Date();
    cache.closing.calendar = today.setDate(today.getDate() + days);
  }

  Session.set('cachedDraft', cache);
};

Template.calendar.onRendered(function () {
  Session.set('cachedDraft', Session.get('draftContract'));
});

Template.calendar.helpers({
  alwaysOn() {
    return (Session.get('cachedDraft') && Session.get('cachedDraft').rules) ? Session.get('cachedDraft').rules.alwaysOn : false;
  },
  criteria() {
    if (!Session.get('cachedDraft').rules.alwaysOn) {
      let criteria = TAPi18n.__('blockchain-time-closing-criteria');
      const result = _.where(token.coin, { code: Session.get('cachedDraft').closing.blockchain });
      criteria = criteria.replace('{{blockchain}}', result[0].name);
      criteria = criteria.replace('{{height}}', Session.get('cachedDraft').closing.height.toLocaleString(undefined, [{ style: 'decimal' }]));
      criteria = criteria.replace('{{date}}', new Date(Session.get('cachedDraft').closing.calendar).format('{Month} {d}, {yyyy}'));
      return criteria;
    }
    return TAPi18n.__('blockchain-time-always-on');
  },
  timers() {
    return {
      enabled: !Session.get('cachedDraft').rules.alwaysOn,
      option: [
        {
          value: (Session.get('cachedDraft').closing.delta === blocktimes.ETHEREUM_DAY),
          label: 'blockchain-time-daily',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_DAY);
          },
        },
        {
          value: (Session.get('cachedDraft').closing.delta === blocktimes.ETHEREUM_WEEK),
          label: 'blockchain-time-weekly',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_WEEK);
          },
        },
        {
          value: (Session.get('cachedDraft').closing.delta === blocktimes.ETHEREUM_MONTH),
          label: 'blockchain-time-monthly',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_MONTH);
          },
        },
        {
          value: (Session.get('cachedDraft').closing.delta === blocktimes.ETHEREUM_QUARTER),
          label: 'blockchain-time-quarterly',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_QUARTER);
          },
        },
        {
          value: (Session.get('cachedDraft').closing.delta === blocktimes.ETHEREUM_YEAR),
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

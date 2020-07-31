import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { animatePopup } from '/imports/ui/modules/popup';

import { blocktimes } from '/lib/const';
import { token } from '/lib/token';
import { getBlockHeight } from '/imports/startup/both/modules/metamask.js';

import { TAPi18n } from 'meteor/tap:i18n';

import '/imports/ui/templates/components/decision/calendar/calendar.html';

const _save = () => {
  const draft = Session.get('draftContract');
  const cache = Session.get('cachedDraft');

  draft.closingm = cache.closing;
  draft.rules.alwaysOn = cache.rules.alwaysOn;

  Session.set('draftContract', cache);
};

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
  const instance = Template.instance();
  Session.set('cachedDraft', Session.get('draftContract'));

  // default setting
  if (Session.get('cachedDraft') && Session.get('cachedDraft').closing.delta === 0) {
    _setBlockTime(blocktimes.ETHEREUM_WEEK);
  }

  window.addEventListener('click', function (e) {
    if (document.getElementById('card-calendar-popup') && !document.getElementById('card-calendar-popup').contains(e.target)) {
      if (!instance.data.readOnly) {
        Session.set('showClosingEditor', false);
        animatePopup(false, 'calendar-popup');
      }
    }
  });
});

Template.calendar.helpers({
  alwaysOn() {
    return (Session.get('cachedDraft') && Session.get('cachedDraft').rules) ? Session.get('cachedDraft').rules.alwaysOn : false;
  },
  criteria() {
    const cache = Session.get('cachedDraft');
    if (Session.get('token')) { token = Session.get('token'); }
    if (cache && !cache.rules.alwaysOn) {
      let criteria = TAPi18n.__('blockchain-time-closing-criteria');
      const result = _.where(token.coin, { code: cache.closing.blockchain });
      criteria = criteria.replace('{{blockchain}}', result[0].name);
      criteria = criteria.replace('{{height}}', cache.closing.height.toLocaleString(undefined, [{ style: 'decimal' }]));
      criteria = criteria.replace('{{date}}', new Date(cache.closing.calendar).format('{Month} {d}, {yyyy}'));
      return criteria;
    }
    return TAPi18n.__('blockchain-time-always-on');
  },
  timers() {
    const cache = Session.get('cachedDraft');
    return {
      enabled: cache ? !cache.rules.alwaysOn : false,
      option: [
        {
          value: cache ? (cache.closing.delta === blocktimes.ETHEREUM_DAY) : false,
          label: 'blockchain-time-daily',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_DAY);
          },
        },
        {
          value: cache ? (cache.closing.delta === blocktimes.ETHEREUM_WEEK) : false,
          label: 'blockchain-time-weekly',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_WEEK);
          },
        },
        {
          value: cache ? (cache.closing.delta === blocktimes.ETHEREUM_MONTH) : false,
          label: 'blockchain-time-monthly',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_MONTH);
          },
        },
        {
          value: cache ? (cache.closing.delta === blocktimes.ETHEREUM_QUARTER) : false,
          label: 'blockchain-time-quarterly',
          action: () => {
            _setBlockTime(blocktimes.ETHEREUM_QUARTER);
          },
        },
        {
          value: cache ? (cache.closing.delta === blocktimes.ETHEREUM_YEAR) : false,
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
  'click #execute-calendar'() {
    _save();
    animatePopup(false, 'calendar-popup');
    Session.set('showClosingEditor', false);
  },
});

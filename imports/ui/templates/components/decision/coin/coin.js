import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup';
import { searchJSON } from '/imports/ui/modules/JSON';
import { token } from '/lib/token';

import '/imports/ui/templates/components/decision/coin/coin.html';

const _save = () => {
  const draft = Session.get('draftContract');
  const coin = Session.get('newCoin');

  draft.constituency = _.reject(draft.constituency, (rule) => { return (rule.kind === 'TOKEN'); });

  if (coin && coin !== '') {
    draft.constituency.push({
      kind: 'TOKEN',
      code: coin.code,
      check: 'EQUAL',
    });
  }

  if (draft.constituency.length === 0) {
    draft.constituencyEnabled = false;
  }

  Session.set('draftContract', draft);
};

Template.coin.onCreated(() => {
  Session.set('showTokens', false);
  Session.set('suggestDisplay', '');
});

Template.coin.onRendered(function () {
});

Template.coin.helpers({
  showTokens() {
    return (Session.get('suggestDisplay') === 'TOKEN');
  },
  token() {
    if (Session.get('newCoin') !== undefined) {
      return Session.get('newCoin').name;
    }
    return undefined;
  },
});

Template.coin.events({
  'click #cancel-coin'() {
    animatePopup(false, 'blockchain-popup');
    Session.set('showCoinSettings', false);
  },
  'click #execute-coin'() {
    _save();
    animatePopup(false, 'blockchain-popup');
    Session.set('showCoinSettings', false);
  },
  'input .token-search'(event) {
    if (event.target.value !== '') {
      Session.set('filteredCoins', searchJSON(token.coin, event.target.value));
    } else {
      Session.set('filteredCoins', token.coin);
      Session.set('newCoin', '');
    }
  },
  'focus .login-input-domain'() {
    Session.set('suggestDisplay', '');
  },
  'focus .token-search'() {
    Session.set('suggestDisplay', 'TOKEN');
  },
});

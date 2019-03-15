import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { animatePopup } from '/imports/ui/modules/popup';
import { searchJSON } from '/imports/ui/modules/JSON';
import { token } from '/lib/token';
import { createPoll } from '/imports/startup/both/modules/Contract';

import '/imports/ui/templates/widgets/setting/setting.js';
import '/imports/ui/templates/components/decision/coin/coin.html';

const Web3 = require('web3');

const web3 = new Web3();

/**
* @summary save data on contract
*/
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
    draft.wallet.currency = coin.code;
  }

  if (draft.constituency.length === 0) {
    draft.constituencyEnabled = false;
  }

  draft.blockchain.publicAddress = document.getElementById('editBlockchainAddress').value;
  draft.blockchain.votePrice = '1';
  for (let i = 0; i < token.coin.length; i += 1) {
    if (token.coin[i].code === coin.code) {
      draft.blockchain.votePrice = token.coin[i].defaultVote;
      break;
    }
  }

  draft.rules = Session.get('cachedDraft').rules;
  if (draft.rules && draft.rules.pollVoting === true) {
    draft.poll = createPoll(draft).poll;
  } else {
    draft.poll = [];
  }

  console.log(draft);

  Session.set('draftContract', draft);
};

/**
* @summary check form inputs are ok
* @return {boolean} true or false baby
*/
const _checkInputs = () => {
  return !(Session.get('noCoinFound') || Session.get('newCoin') === '' || (Session.get('draftContract').blockchain.publicAddress && !Session.get('checkBlockchainAddress')));
};

Template.coin.onCreated(() => {
  Session.set('showTokens', false);
  Session.set('suggestDisplay', '');

  Template.instance().showAdvanced = new ReactiveVar(false);
  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.coin.onRendered(function () {
  // show current coin set in draft
  const draft = Session.get('draftContract');
  for (let i = 0; i < draft.constituency.length; i += 1) {
    if (draft.constituency[i].kind === 'TOKEN') {
      for (let j = 0; j < token.coin.length; j += 1) {
        if (token.coin[j].code === draft.constituency[i].code) {
          Session.set('newCoin', token.coin[j]);
          break;
        }
      }
      break;
    }
  }

  let advancedSettings = false;
  _.find(Session.get('draftContract').rules, function (num) { if (num) { advancedSettings = true; } });
  Template.instance().showAdvanced.set(advancedSettings);


  Session.set('cachedDraft', Session.get('draftContract'));
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
  address() {
    const draft = Session.get('draftContract');
    if (draft.blockchain.publicAddress) {
      Session.set('checkBlockchainAddress', web3.utils.isAddress(draft.blockchain.publicAddress));
      return draft.blockchain.publicAddress;
    }
    return '';
  },
  price() {
    const draft = Session.get('draftContract');
    if (draft.blockchain.votePrice) {
      return draft.blockchain.votePrice;
    }
    return '';
  },
  contract() {
    return Session.get('draftContract');
  },
  balanceVoting() {
    return Session.get('cachedDraft').rules ? Session.get('cachedDraft').rules.balanceVoting : false;
  },
  quadraticVoting() {
    return Session.get('cachedDraft').rules ? Session.get('cachedDraft').rules.quadraticVoting : false;
  },
  pollVoting() {
    return Session.get('cachedDraft').rules ? Session.get('cachedDraft').rules.pollVoting : false;
  },
  wrongAddress() {
    const draft = Session.get('draftContract');
    if (draft.blockchain.coin.code !== 'STX') {
      return !Session.get('checkBlockchainAddress');
    }
    return false;
  },
  buttonDisable() {
    if (!_checkInputs()) {
      return 'button-disabled';
    }
    return '';
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
  showAdvanced() {
    return Template.instance().showAdvanced.get();
  },
});

Template.coin.events({
  'click #cancel-coin'() {
    animatePopup(false, 'blockchain-popup');
    Session.set('showCoinSettings', false);
  },
  'click #advanced'(event) {
    event.preventDefault();
    const advanced = Template.instance().showAdvanced.get();
    Template.instance().showAdvanced.set(!advanced);
  },
  'click #execute-coin'() {
    if (_checkInputs()) {
      _save();
      animatePopup(false, 'blockchain-popup');
      Session.set('showCoinSettings', false);
    }
  },
  'input #editBlockchainAddress'() {
    if (document.getElementById('editBlockchainAddress')) {
      const address = document.getElementById('editBlockchainAddress').value;
      Session.set('checkBlockchainAddress', web3.utils.isAddress(address));
    }
  },
  'input #editVotePrice'() {
    if (document.getElementById('editVotePrice')) {
      const price = document.getElementById('editVotePrice').value;
      if (price.toNumber() < 0) {
        document.getElementById('editVotePrice').value = '';
      }
    }
  },
  'input .token-search'(event) {
    if (event.target.value !== '') {
      Session.set('filteredCoins', searchJSON(token.coin, event.target.value));
    } else {
      Session.set('filteredCoins', token.coin);
      Session.set('newCoin', '');
    }
  },
  'focus .token-search'() {
    Session.set('suggestDisplay', 'TOKEN');
  },
});

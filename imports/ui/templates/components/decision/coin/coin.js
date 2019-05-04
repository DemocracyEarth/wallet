import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { animatePopup } from '/imports/ui/modules/popup';
import { searchJSON } from '/imports/ui/modules/JSON';
import { token } from '/lib/token';
import { createPoll, removePoll } from '/imports/startup/both/modules/Contract';
import { Contracts } from '/imports/api/contracts/Contracts';
import { getCoin } from '/imports/api/blockchain/modules/web3Util';

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
    draft.blockchain.coin.code = coin.code;
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
    if (draft.rules && !draft.rules.pollVoting && draft.poll.length > 0) {
      removePoll(draft);
    }
    draft.poll = [];
  }

  Session.set('draftContract', draft);
};

/**
* @summary checks if there's an issue with lockchain address
* @return {boolean} true or false baby
*/
const _verifyBlockchainAddress = () => {
  const draft = Session.get('draftContract');
  if (draft.blockchain.coin.code !== 'STX') {
    // return Session.get('checkBlockchainAddress');
    if (document.getElementById('editBlockchainAddress') && document.getElementById('editBlockchainAddress').value) {
      return !web3.utils.isAddress(document.getElementById('editBlockchainAddress').value);
    }
  }
  return false;
};

/**
* @summary check form inputs are ok
* @return {boolean} true or false baby
*/
const _checkInputs = () => {
  return !(Session.get('noCoinFound')
    || Session.get('newCoin') === ''
    || (Session.get('draftContract').blockchain.publicAddress && !Session.get('checkBlockchainAddress'))
    || (!Meteor.user().profile.wallet.reserves && Session.get('draftContract').blockchain.coin.code !== 'WEB VOTE')
    || (_verifyBlockchainAddress() && Session.get('newCoin') && Session.get('newCoin').code !== 'WEB VOTE'));
};

Template.coin.onCreated(() => {
  Session.set('showTokens', false);
  Session.set('suggestDisplay', '');

  Template.instance().currentCoin = new ReactiveVar();
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

  // let advancedSettings = false;
  // _.find(Session.get('draftContract').rules, function (num) { if (num) { advancedSettings = true; } });
  // Template.instance().showAdvanced.set(advancedSettings);
  Template.instance().showAdvanced.set((Session.get('draftContract').rules.quadraticVoting === true));


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
    if (draft.blockchain && draft.blockchain.publicAddress && Session.get('newCoin').code !== 'WEB VOTE') {
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
    if (Session.get('newCoin')) {
      const coin = getCoin(Session.get('newCoin').code);
      console.log(coin);
      if (!coin.editor.allowBalanceToggle) {
        const cache = Session.get('cachedDraft');
        cache.rules.balanceVoting = false;
        Session.set('cachedDraft', cache);
      }
      return Session.get('cachedDraft').rules ? (Session.get('cachedDraft').rules.balanceVoting && coin.editor.allowBalanceToggle) : false;
    }
    return false;
  },
  quadraticVoting() {
    if (Session.get('newCoin')) {
      const coin = getCoin(Session.get('newCoin').code);
      if (!coin.editor.allowQuadraticToggle) {
        const cache = Session.get('cachedDraft');
        cache.rules.quadraticVoting = false;
        Session.set('cachedDraft', cache);
      }
      return Session.get('cachedDraft').rules ? (Session.get('cachedDraft').rules.quadraticVoting && coin.editor.allowQuadraticToggle) : false;
    }
    return false;
  },
  pollVoting() {
    return (Session.get('cachedDraft') && Session.get('cachedDraft').rules) ? Session.get('cachedDraft').rules.pollVoting : false;
  },
  allowBalance() {
    if (Session.get('newCoin')) {
      const coin = getCoin(Session.get('newCoin').code);
      return coin.editor.allowBalanceToggle;
    }
    return false;
  },
  allowQuadratic() {
    if (Session.get('newCoin')) {
      const coin = getCoin(Session.get('newCoin').code);
      return coin.editor.allowQuadraticToggle;
    }
    return false;
  },
  wrongAddress() {
    if (Session.get('isAddressWrong')) { return true; }
    if (Session.get('newCoin')) {
      const coin = getCoin(Session.get('newCoin').code);
      if (coin.type === 'ERC20' || coin.type === 'NATIVE') {
        if (document.getElementById('editBlockchainAddress') && document.getElementById('editBlockchainAddress').value === '') {
          if (Meteor.user().profile.wallet.reserves.length > 0 && Meteor.user().profile.wallet.reserves[0].publicAddress) {
            document.getElementById('editBlockchainAddress').value = Meteor.user().profile.wallet.reserves[0].publicAddress;
            Session.set('isAddressWrong', false);
          }
        }
        return _verifyBlockchainAddress();
      }
    }
    return Session.get('isAddressWrong');
  },
  addressStyle() {
    if (Session.get('newCoin') && Session.get('newCoin').code === 'WEB VOTE') {
      return 'display: none;';
    }
    return '';
  },
  buttonDisable() {
    if (Session.get('isAddressWrong')) { return 'button-disabled'; }
    if (Session.get('newCoin')) {
      if (!_checkInputs() || (document.getElementById('editBlockchainAddress') && document.getElementById('editBlockchainAddress').value === '')) {
        return 'button-disabled';
      }
    }
    return '';
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
  showAdvanced() {
    return Template.instance().showAdvanced.get();
  },
  showReserves() {
    if (Meteor.user() && Meteor.user().profile.wallet.reserves) {
      return 'display:auto;';
    }
    return 'display:none;';
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
    if (_checkInputs() || !Session.get('isAddressWrong')) {
      _save();
      animatePopup(false, 'blockchain-popup');
      Session.set('showCoinSettings', false);
    }
  },
  'input #editBlockchainAddress'() {
    if (document.getElementById('editBlockchainAddress')) {
      Session.set('isAddressWrong', _verifyBlockchainAddress());
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

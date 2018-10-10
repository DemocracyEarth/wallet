import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { animatePopup } from '/imports/ui/modules/popup';
import { searchJSON } from '/imports/ui/modules/JSON';
import { token } from '/lib/token';

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
  }

  if (draft.constituency.length === 0) {
    draft.constituencyEnabled = false;
  }

  draft.blockchain.publicAddress = document.getElementById('editBlockchainAddress').value;
  draft.blockchain.votePrice = document.getElementById('editVotePrice').value;

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
      Session.set('checkBlockchainAddress', web3.isAddress(draft.blockchain.publicAddress));
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
  wrongAddress() {
    return !Session.get('checkBlockchainAddress');
  },
  buttonDisable() {
    if (!_checkInputs()) {
      return 'button-disabled';
    }
    return '';
  },
});

Template.coin.events({
  'click #cancel-coin'() {
    animatePopup(false, 'blockchain-popup');
    Session.set('showCoinSettings', false);
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
      Session.set('checkBlockchainAddress', web3.isAddress(address));
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

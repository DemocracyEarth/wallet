import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { TAPi18n } from 'meteor/tap:i18n';

import { displayPopup, animatePopup } from '/imports/ui/modules/popup';
import { getContractToken } from '/imports/ui/templates/widgets/transaction/transaction';
import { getCoin } from '/imports/api/blockchain/modules/web3Util.js';
import { token } from '/lib/token';
import { formatCryptoValue } from '/imports/ui/templates/components/decision/balance/balance';

import '/imports/ui/templates/components/decision/blockchain/blockchain.html';

/**
* @summary returns whether user has a crypto or not
* @param {object} user user wallet
* @param {object} token ticker
* @return {boolean} if user can spend
*/
const _getTokenAddress = (user, ticker) => {
  if (user.profile.wallet.reserves && user.profile.wallet.reserves.length > 0) {
    for (let i = 0; i < user.profile.wallet.reserves.length; i += 1) {
      for (let k = 0; k < token.coin.length; k += 1) {
        if (token.coin[k].code === ticker || (token.coin[k].subcode && token.coin[k].subcode === ticker)) {
          if (token.coin[k].code === user.profile.wallet.reserves[i].token || token.coin[k].subcode === user.profile.wallet.reserves[i].token) {
            return user.profile.wallet.reserves[i].publicAddress;
          }
        }
      }
    }
  }
  return false;
};

/**
* @summary returns whether user meets or not constituency criteria
* @param {object} contract contract to evaluate
* @return {boolean} if user can vote or not
*/
const _verifyConstituencyRights = (contract) => {
  let legitimacy = true;

  if (Meteor.user()) {
    if (contract.constituency && contract.constituency.length > 0) {
      for (const i in contract.constituency) {
        switch (contract.constituency[i].kind) {
          case 'TOKEN':
            if (_getTokenAddress(Meteor.user(), contract.constituency[i].code)) {
              legitimacy = true;
            } else {
              legitimacy = false;
            }
            break;
          default:
            if (Meteor.user().profile.country && Meteor.user().profile.country.code !== contract.constituency[i].code) {
              legitimacy = false;
            }
            break;
        }
        if (legitimacy === false) {
          break;
        }
      }
    } else {
      legitimacy = true;
    }
  } else {
    legitimacy = false;
  }

  return legitimacy;
};

/**
* @summary write in textual form the requirements to vote
* @param {object} contract contract with constituency rules
*/
const _writeRule = (contract, textOnly) => {
  let format = '';
  if (textOnly) {
    format = '-textonly';
  }
  let sentence = TAPi18n.__(`electorate-sentence-anyone${format}`);
  let setting;

  if (contract.constituency) {
    sentence = TAPi18n.__(`electorate-sentence-only${format}`);
    let coin;

    let found;
    for (const i in contract.constituency) {
      found = false;
      switch (contract.constituency[i].kind) {
        case 'TOKEN':
          found = true;
          coin = _.where(token.coin, { code: contract.constituency[i].code })[0];
          if (!textOnly && contract.constituency.length > 0) {
            setting = `<div class="suggest-item suggest-token suggest-token-inline" style="background-color: ${coin.color} ">${coin.code}</div>`;
            break;
          } else if (textOnly) {
            setting = `${TAPi18n.__('holding')} ${_.where(token.coin, { code: contract.constituency[i].code })[0].name}`;
          } else {
            setting = _.where(token.coin, { code: contract.constituency[i].code })[0].name;
          }
          break;
        default:
          break;
      }
      if (found) {
        sentence = sentence.replace('{{setting0}}', setting);
      }
    }
  }
  return sentence;
};

Template.blockchain.onCreated(() => {
  let contract;
  if (!Template.currentData().readOnly) {
    contract = Session.get('draftContract');
  } else {
    contract = Template.currentData().contract;
  }
  Session.set('showCoinSettings', false);
  Template.instance().voteEnabled = _verifyConstituencyRights(contract);
});

const _toggleCoinSettings = () => {
  if (!Session.get('showCoinSettings')) {
    Session.set('showCoinSettings', true);
  } else {
    Session.set('showCoinSettings', false);
  }
};


const killPopup = () => {
  _toggleCoinSettings();
  displayPopup($('#blockchain-button')[0], 'coin', Meteor.userId(), 'click', 'blockchain-popup');
};

Template.blockchain.onRendered(function () {
  const instance = this;
  window.addEventListener('click', function (e) {
    if (document.getElementById('card-blockchain-popup') && !document.getElementById('card-blockchain-popup').contains(e.target)) {
      if (!instance.data.readOnly) {
        Session.set('showCoinSettings', false);
        animatePopup(false, 'blockchain-popup');
      }
    }
  });
});

Template.blockchain.helpers({
  status() {
    let rule;
    const contract = Session.get('draftContract');
    if (!this.readOnly) {
      rule = _writeRule(contract);
      if (rule === TAPi18n.__('electorate-sentence-anyone')) {
        rule = TAPi18n.__('voting');
      }
      return `${TAPi18n.__('voting')} &#183;`;
    }
    return '';
  },
  pollInside() {
    const contract = Session.get('draftContract');
    return (contract.rules && contract.rules.pollVoting);
  },
  ticker() {
    if (Meteor.user().profile.wallet.reserves) {
      const contract = Session.get('draftContract');
      let label = contract.wallet.currency;
      if (contract.rules && contract.rules.quadraticVoting && !contract.rules.balanceVoting) {
        label = `${TAPi18n.__('ticker-rule-quadratic')} ${label}`;
      } else if (contract.rules && contract.rules.balanceVoting && !contract.rules.quadraticVoting) {
        label = `${label} ${TAPi18n.__('ticker-rule-balance')}`;
      } else if (contract.rules && contract.rules.balanceVoting && contract.rules.quadraticVoting) {
        label = `${TAPi18n.__('ticker-rule-quadratic')} ${label} ${TAPi18n.__('ticker-rule-balance')}`;
      }
      return label;
    }
    return `${TAPi18n.__('no-tokens')}`;
  },
  tickerStyle() {
    let color;
    let style = '';
    if (Session.get('showCoinSettings')) {
      color = '#fff';
      style += 'color: #6e5b7e; ';
    } else {
      color = getCoin(Session.get('draftContract').wallet.currency).color;
    }
    if (color) {
      style += `background-color: ${color}; border-color: ${color}`;
    }
    return style;
  },
  balanceStyle() {
    let style = '';
    let color;
    if (Session.get('showCoinSettings')) {
      color = '#fff';
    } else {
      color = getCoin(Session.get('draftContract').wallet.currency).color;
    }
    if (color) {
      style = `border-color: ${color}; `;
      style += `color: ${color} `;
    }
    return style;
  },
  balance() {
    return formatCryptoValue(0, Session.get('draftContract').wallet.currency);
  },
  editorId() {
    if (!this.readOnly) {
      return 'blockchain-button';
    }
    return '';
  },
  description() {
    if (this.readOnly) {
      return _writeRule(this.contract, true);
    }
    return '';
  },
  check() {
    return Template.instance().voteEnabled;
  },
  icon() {
    if (!this.readOnly) {
      if (Session.get('showCoinSettings')) {
        return 'active';
      }
    }
    return 'enabled';
  },
  readOnly() {
    if (this.readOnly) {
      return 'blockchain-button-readonly';
    }
    return '';
  },
  userWithTokenReserves() {
    if (Meteor.user() && Meteor.user().profile.wallet.reserves) {
      return true;
    }
    return false;
  },
});

Template.blockchain.events({
  'click #blockchain-button'() {
    if (!this.readOnly && Meteor.user().profile.wallet.reserves !== undefined) {
      killPopup();
    }
  },
});

export const verifyConstituencyRights = _verifyConstituencyRights;
export const getTokenAddress = _getTokenAddress;

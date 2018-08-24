import { Template } from 'meteor/templating';

import { getCoin } from '/imports/ui/templates/components/identity/chain/chain';
import { wei2eth } from '/imports/api/blockchain/modules/web3Util';

import '/imports/ui/templates/components/identity/login/profile/multiTokenProfile.html';

const numeral = require('numeral');

/**
* @summary gets width in percentage according to placed tokens
* @param {number} balance total balance
* @param {number} placed staked tokens
* @returns {number}
*/
const _getWidth = (balance, placed) => {
  if (balance === 0) { return 0; }
  return parseInt((placed * 100) / balance, 10);
};

/**
* @summary shows balance in currency not decimals
* @param {object} value value to be changed
* @param {string} token currency being used
* @returns {number}
*/
const _currencyValue = (value, token) => {
  switch (token) {
    case 'WEI':
      return wei2eth(value);
    default:
  }
  return value;
};

/**
* @summary shows percentag of staked Tokens
* @param {object} coin template data
* @returns {number}
*/
const _getPercentage = (coin) => {
  return _getWidth(coin.balance, coin.placed);
};

Template.balance.onCreated(function () {
  Template.instance().coin = getCoin(Template.currentData().token);
  Template.instance().percentage = _getPercentage(Template.currentData());
});

Template.balance.helpers({
  balanceStyle() {
    const coin = Template.instance().coin;
    if (coin.color) {
      return `border-color: ${coin.color}`;
    }
    return '';
  },
  tickerStyle() {
    const coin = Template.instance().coin;
    if (coin.color) {
      return `background-color: ${coin.color}; border-color: ${coin.color}`;
    }
    return '';
  },
  barStyle() {
    const coin = Template.instance().coin;
    return `background-color: ${coin.color}; width: ${Template.instance().percentage}%`;
  },
  unanimous() {
    if (Template.instance().percentage === 100) {
      return 'unanimous';
    }
    return '';
  },
  ticker() {
    return Template.instance().coin.code;
  },
  available() {
    return numeral(_currencyValue(this.available, this.token)).format(Template.instance().coin.format);
  },
  percentage() {
    return `${_getPercentage(this)}%`;
  },
  balance() {
    const balance = _currencyValue(this.balance, this.token);
    return numeral(balance).format(Template.instance().coin.format);
  },
});

Template.multiTokenProfile.helpers({
  tokens() {
    const wallet = this.profile.wallet;
    const tokens = [];

    // push VOTE balance as first element in tokens array
    const voteToken = {
      token: wallet.currency,
      balance: wallet.balance,
      available: wallet.available,
      placed: wallet.placed,
    };
    tokens.push(voteToken);

    // loop through reserves array and push each to tokens
    for (const i in wallet.reserves) {
      const reservesToken = {
        token: wallet.reserves[i].token,
        balance: wallet.reserves[i].balance,
        placed: wallet.reserves[i].placed,
        available: wallet.reserves[i].available,
      };
      tokens.push(reservesToken);
    }
    return tokens;
  },
});

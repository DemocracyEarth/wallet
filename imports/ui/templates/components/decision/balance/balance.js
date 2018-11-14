import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import { wei2eth, removeDecimal, getCoin } from '/imports/api/blockchain/modules/web3Util';
import { timeCompressed } from '/imports/ui/modules/chronos';
import { token } from '/lib/token';
import { Contracts } from '/imports/api/contracts/Contracts';

import '/imports/ui/templates/components/decision/balance/balance.html';

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
const _currencyValue = (value, tokenCode) => {
  switch (tokenCode) {
    case 'WEI':
      return wei2eth(value.toString());
    // case 'VOTE':
    //   return adjustDecimal(value);
    default:
      return value;
  }
};

/**
* @summary format currency display according to crypto rules
* @param {string} value value to be changed
* @param {string} tokenCode currency being used
* @returns {string} formatted number
*/
const _formatCryptoValue = (value, tokenCode) => {
  let tokenFinal;
  if (!tokenCode) { tokenFinal = 'ETH'; } else { tokenFinal = tokenCode; }
  return numeral(_currencyValue(value, tokenFinal)).format(getCoin(tokenFinal).format);
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
    let style = '';
    const coin = Template.instance().coin;
    if (coin.color) {
      style = `border-color: ${coin.color}; `;
      if (this.isTransaction) {
        if (this.isRevoke) {
          style += 'color: #ff2752 ';
        } else {
          style += `color: ${coin.color} `;
        }
      }
    }
    return style;
  },
  tokenStyle() {
    let style = '';
    if (this.isTransaction) {
      style += 'token-ledger';
    }
    if (this.isButton) {
      style += ' token-button';
    }
    return style;
  },
  tickerStyle() {
    const coin = Template.instance().coin;
    if (coin.color) {
      return `background-color: ${coin.color}; border-color: ${coin.color}`;
    }
    return '';
  },
  hasDate() {
    return this.date;
  },
  sinceDate() {
    return `${timeCompressed(this.date)}`;
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
    return _formatCryptoValue(this.available, this.token);
  },
  percentage() {
    return `${_getPercentage(this)}%`;
  },
  balance() {
    const instance = Template.instance();
    if (this.blockchain && this.blockchain.score && this.isButton) {
      if (this.contract._id) {
        const contract = Contracts.findOne({ _id: this.contract._id });
        if (contract && contract.blockchain) {
          this.blockchain = contract.blockchain;
        }
      }
      const confirmed = _currencyValue(this.blockchain.score.finalConfirmed, this.token);
      return `${numeral(confirmed).format(instance.coin.format)}`;
    }
    if (this.isCrypto && this.value) {
      const coinData = getCoin(instance.coin.code);
      return _formatCryptoValue(removeDecimal(this.value, coinData.decimals).toNumber(), instance.coin.code);
    }
    const balance = _currencyValue(this.balance, this.token);
    return numeral(balance).format(Template.instance().coin.format);
  },
  hasPending() {
    if (this.blockchain && this.blockchain.score) {
      if (this.contract._id) {
        const contract = Contracts.findOne({ _id: this.contract._id });
        if (contract && contract.blockchain) {
          this.blockchain = contract.blockchain;
        }
      }
      return (this.blockchain.score.finalPending);
    }
    return false;
  },
  pending() {
    if (this.blockchain && this.blockchain.score) {
      if (this.contract._id) {
        const contract = Contracts.findOne({ _id: this.contract._id });
        if (contract && contract.blockchain) {
          this.blockchain = contract.blockchain;
        }
      }
      const instance = Template.instance();
      const pending = _currencyValue(this.blockchain.score.finalPending, this.token);
      return `${numeral(pending).format(instance.coin.format)} ${TAPi18n.__('pending')}`;
    }
    return '';
  },
});

export const formatCryptoValue = _formatCryptoValue;

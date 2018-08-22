import { Template } from 'meteor/templating';

import { getCoin } from '/imports/ui/templates/components/identity/chain/chain';

import '/imports/ui/templates/components/identity/login/profile/multiTokenProfile.html';

const numeral = require('numeral');

const _getWidth = (total, available) => {
  return `${parseInt((available * total) / 100, 10)}%`;
};

Template.balance.onCreated(function () {
  Template.instance().coin = getCoin(Template.currentData().token);
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
    return `background-color: ${coin.color}; width: ${_getWidth(this.balance, this.available)}`;
  },
  ticker() {
    return Template.instance().coin.code;
  },
  percentage() {
    return _getWidth(this.balance, this.available);
  },
  balance() {
    return numeral(this.balance).format(Template.instance().coin.format);
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

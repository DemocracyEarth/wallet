import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import { getCoin } from '/imports/ui/templates/components/identity/chain/chain';

import '/imports/ui/templates/components/identity/login/profile/multiTokenProfile.html';
import '/imports/ui/templates/components/identity/login/profile/profile.js';
import '/imports/ui/templates/components/identity/login/profile/profile.html';

Template.balance.onCreated(function () {
  Template.instance().coin = getCoin(Template.currentData().token);
  console.log('eh');
  console.log(this);
  console.log(Template.currentData());
  console.log(getCoin(Template.currentData().token));
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
  ticker() {
    return Template.instance().coin.code;
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
    };
    tokens.push(voteToken);

    // loop through reserves array and push each to tokens
    for (const i in wallet.reserves) {
      const reservesToken = {
        token: wallet.reserves[i].token,
        balance: wallet.reserves[i].balance,
        percentage: 0,
        available: 0,
      };
      tokens.push(reservesToken);
    }
    return tokens;
  },
});

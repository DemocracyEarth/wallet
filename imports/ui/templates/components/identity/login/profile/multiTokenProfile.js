import { Template } from 'meteor/templating';

import '/imports/ui/templates/components/identity/login/profile/multiTokenProfile.html';
import '/imports/ui/templates/components/decision/balance/balance.js';

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

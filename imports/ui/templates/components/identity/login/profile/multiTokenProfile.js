import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';

import './multiTokenProfile.html';
import './profile.js';
import './profile.html';

Template.multiTokenProfile.helpers({
  tokens() {
    console.log('DEBUG - multiTokenProfile.js - tokens()');
    const wallet = Meteor.user().profile.wallet;
    let tokens = [];

    // push VOTE balance as first element in tokens array
    let voteToken = {
      token: wallet.currency,
      balance: wallet.balance
    }
    tokens.push(voteToken);
    
    // loop through reserves array and push each to tokens
    for(var i in wallet.reserves){
      let reservesToken = {
        token: wallet.reserves[i].token,
        balance: wallet.reserves[i].balance
      };
      tokens.push(reservesToken);
    }
    
    return tokens;
  },
});

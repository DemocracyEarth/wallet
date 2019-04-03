import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { rules } from '/lib/const';

import '/imports/ui/templates/components/identity/login/profile/multiTokenProfile.html';
import '/imports/ui/templates/components/decision/balance/balance.js';

const numeral = require('numeral');

Template.multiTokenProfile.onCreated(function () {
  Template.instance().pollScore = new ReactiveVar(0);
});

Template.multiTokenProfile.helpers({
  tokens() {
    const wallet = this.profile.wallet;
    const tokens = [];

    // push WEB VOTE balance as first element in tokens array, if present
    if (wallet.balance > 0) {
      const webVote = {
        token: wallet.currency,
        balance: wallet.balance,
        available: wallet.available,
        placed: wallet.placed,
        disableStake: true,
        disableBar: false,
      };
      tokens.push(webVote);
    }

    // loop through reserves array and push each to tokens
    for (const i in wallet.reserves) {
      const reservesToken = {
        token: wallet.reserves[i].token,
        balance: wallet.reserves[i].balance,
        placed: wallet.reserves[i].placed,
        available: wallet.reserves[i].available,
        disableStake: true,
        disableBar: true,
      };
      tokens.push(reservesToken);
    }
    return tokens;
  },
  pollScore(available, balance) {
    const percentage = ((available * 100) / rules.VOTES_INITIAL_QUANTITY);
    Template.instance().pollScore.set(percentage);
    return `${numeral(percentage).format('0.00')}%`;
    /*
    // color
    let score = '';

    // score
    let choiceVotes;
    if (this.pollTotals) {
      switch (this.contract.blockchain.coin.code) {
        case 'WEB VOTE':
          choiceVotes = 0;
          for (let k = 0; k < this.contract.tally.voter.length; k += 1) {
            choiceVotes += this.contract.tally.voter[k].votes;
          }
          break;
        default:
          choiceVotes = this.contract.blockchain.score ? this.contract.blockchain.score.totalConfirmed : '0';
      }
    }
    const bnVotes = new BigNumber(choiceVotes);
    const bnTotal = new BigNumber(this.pollTotals);
    let percentage;
    // eslint-disable-next-line eqeqeq
    if (bnTotal != 0) {
      percentage = new BigNumber(bnVotes.multipliedBy(100)).dividedBy(bnTotal);
    } else {
      percentage = 0;
    }
    Template.instance().pollScore.set(percentage);
    score = `${numeral(percentage).format('0.00')}%`;

    return score;
    */
  },
  smallPercentageStyle() {
    if (Template.instance().pollScore.get() < 10) {
      return 'poll-score-small';
    }
    return '';
  },
});

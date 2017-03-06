import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import { splitRender } from '/imports/ui/modules/split';
import { userVotesInContract } from '/imports/startup/both/modules/User';

import './contract.html';
import '../title/title.js';
import '../agreement/agreement.js';
import '../semantics/semantics.js';
import '../signatures/signatures.js';
import '../vote/vote.js';
import '../ballot/ballot.js';
import '../action/action.js';
import '../results/results.js';
import '../agora/agora.js';

Template.contract.onRendered(() => {
  // set pixel width of left and right split panels
  splitRender();
});

Template.contract.helpers({
  editorMode() {
    if (Session.get('contract')) {
      return (Session.get('contract').stage === 'DRAFT');
    }
    return undefined;
  },
  isDelegation() {
    if (Session.get('contract')) {
      return (Session.get('contract').kind === 'DELEGATION');
    }
    return undefined;
  },
  pollClosed() {
    if (Session.get('contract')) {
      return (Session.get('contract').stage === 'FINISH');
    }
    return undefined;
  },
  ballotToggle() {
    if (Session.get('contract')) {
      if (Session.get('contract').ballotEnabled === false) {
        return 'paper-empty';
      }
    }
    return '';
  },
  ballotEnabled() {
    if (Session.get('contract')) {
      return Session.get('contract').ballotEnabled;
    }
    return false;
  },
  voter() {
    const ledger = Session.get('contract').wallet.ledger;
    const voters = [];
    let hasVote;
    for (const index in ledger) {
      hasVote = 0;
      if (!voters.find(ledger[index].entityId)) {
        hasVote = userVotesInContract(Meteor.users.findOne({ _id: ledger[index].entityId }).profile.wallet, Session.get('contract')._id);
        if (hasVote > 0) {
          voters.push(ledger[index].entityId);
        }
      }
    }
    return voters;
  },
});

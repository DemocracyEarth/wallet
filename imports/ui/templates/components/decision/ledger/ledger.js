import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { setupSplit } from '/imports/ui/modules/split';
import { Contracts } from '/imports/api/contracts/Contracts';

import '/imports/ui/templates/components/decision/ledger/ledger.html';

/**
* @summary turns a query for contracts into one for transactions
* @param {object} instance asking for query change
*/
const _convertQuery = (instance) => {
  const tally = instance;
  switch (tally.options.view) {
    case 'latest':
      tally.options.view = 'lastVotes';
      break;
    case 'token':
      tally.options.view = 'transactionsToken';
      break;
    case 'geo':
      tally.options.view = 'transactionsGeo';
      break;
    case 'peer':
      tally.options.view = 'transactionsPeer';
      break;
    default:
  }
  return tally;
};

Template.ledger.onCreated(function () {
  setupSplit();
  Template.instance().postReady = new ReactiveVar(false);
  Session.set('isLedgerReady', false);

  const instance = this;

  instance.autorun(function (computation) {
    const subscription = instance.subscribe('transaction', _convertQuery(instance.data).options);
    if (subscription.ready() && !instance.postReady.get()) {
      instance.postReady.set(true);
      computation.stop();
    }
  });
});

Template.ledger.helpers({
  ready() {
    return Template.instance().ready.get();
  },
  emptyThread() {
    if (Session.get('contract')) {
      if (Session.get('contract').events !== undefined && Session.get('contract').events.length > 0) {
        return false;
      }
      return true;
    }
    return undefined;
  },
  event() {
    if (Session.get('contract')) {
      return Session.get('contract').events;
    }
    return undefined;
  },
  postReady() {
    return Template.instance().postReady.get();
  },
  delegationVotes() {
    const tally = this;
    tally.options.view = 'delegationVotes';
    tally.options.kind = 'DELEGATION';
    tally.options.sort = { timestamp: -1 };
    return tally;
  },
  peerVotes() {
    const tally = this;
    tally.options.view = 'userVotes';
    tally.options.kind = 'VOTE';
    tally.options.sort = { timestamp: -1 };
    return tally;
  },
  postVotes() {
    const tally = this;
    tally.options.view = 'threadVotes';
    tally.options.sort = { timestamp: -1 };

    // winning options
    const contract = Contracts.findOne({ keyword: Template.currentData().options.keyword });
    let maxVotes = 0;
    let winningBallot;
    if (contract && contract.tally) {
      for (const i in contract.tally.choice) {
        if (contract.tally.choice[i].votes > maxVotes) {
          maxVotes = contract.tally.choice[i].votes;
          winningBallot = contract.tally.choice[i].ballot;
        }
      }
      tally.winningBallot = winningBallot;
    }

    return tally;
  },
  homeVotes() {
    return _convertQuery(this);
  },
  isLedgerReady() {
    return Session.get('isLedgerReady');
  },
  ledgerTitle() {
    return this.ledgerTitle;
  },
});

Template.ledger.events({
  'mousedown #resizable'(event) {
    event.preventDefault();
    Session.set('resizeSplit', true);
    Session.set('resizeSplitCursor', {
      x: parseInt(event.pageX - parseInt($('.split-right').css('marginLeft'), 10), 10),
      y: event.pageY,
      windowWidth: window.innerWidth,
    });
  },
});

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

import { query } from '/lib/views';
import { here } from '/lib/utils';
import { Transactions } from '/imports/api/transactions/Transactions';
import { getUser } from '/imports/ui/templates/components/identity/avatar/avatar';

import '/imports/ui/templates/widgets/tally/tally.html';

/**
* @summary translates data info about vote into a renderable contracts
* @param {object} post a transaction Object
*/
const _voteToContract = (post, contract, hidePost, winningBallot, openFeed) => {
  const transaction = {
    _id: post._id,
    ballot: post.condition.ballot,
    senderId: post.input.entityId,
    receiverId: post.output.entityId,
    isVote: true,
    hidePost: (post.isRagequit) ? false : hidePost,
    winningBallot,
    isRevoke: (post.input.entityType !== 'INDIVIDUAL'),
    isRagequit: post.isRagequit,
    contractId: post.contractId,
    collectiveId: post.collectiveId,
  };
  if (openFeed) {
    // for a feed in a general context (home page)
    if (post.kind === 'DELEGATION') {
      if (post.input.entityType === 'CONTRACT') {
        transaction.senderId = post.input.delegateId;
      } else if (post.output.entityType === 'CONTRACT') {
        transaction.receiverId = post.output.delegateId;
      }
      transaction.isVote = false;
    }
    transaction.contract = {
      timestamp: post.timestamp,
      kind: post.kind,
      wallet: {
        balance: post.output.quantity,
        currency: post.output.currency,
      },
      _id: post._id,
    };
  } else if (contract) {
    transaction.contract = {
      _id: contract._id,
      timestamp: post.timestamp,
      wallet: {
        balance: post.input.quantity,
        currency: post.input.currency,
      },
      title: contract.title,
      url: contract.url,
    };
  }
  if (post.blockchain) {
    transaction.contract.blockchain = post.blockchain;
  }
  return transaction;
};

const _requiresUserSubscription = (transaction) => {
  let userId;
  if (transaction.input.entityType === 'INDIVIDUAL') {
    userId = transaction.input.entityId;
  } else if (transaction.output.entityType === 'INDIVIDUAL') {
    userId = transaction.output.entityId;
  }
  if (userId && !Meteor.users.findOne({ _id: userId })) {
    return userId;
  }
  return false;
};

const _isWinningVote = (winningBallot, voterBallot) => {
  for (const i in voterBallot) {
    for (const k in winningBallot) {
      if (voterBallot[i]._id === winningBallot[k]._id) {
        return true;
      }
    }
  }
  return false;
};

const _buildFeed = (id, fields, instance, contract, noTitle) => {
  // added stuff
  const currentFeed = instance.feed.get();
  const post = fields;
  post._id = id;
  const userSubscriptionId = _requiresUserSubscription(post);
  if (userSubscriptionId) {
    getUser(userSubscriptionId);
  }
  let skipPending = false;
  if (fields.kind === 'VOTE' && fields.status === 'PENDING') {
    skipPending = true;
  }

  const voteContract = _voteToContract(post, contract, noTitle, _isWinningVote(instance.data.winningBallot, post.condition.ballot), instance.openFeed);

  if (!skipPending) {
    if (!currentFeed) {
      instance.feed.set([voteContract]);
    } else if (!here(voteContract, currentFeed)) {
      currentFeed.push(voteContract);
      instance.feed.set(_.uniq(currentFeed));
    }
  }
};

const _defaultTally = (view) => {
  return (view === 'lastVotes' ||
    view === 'threadVotes' ||
    view === 'periodVotes' ||
    view === 'transactionsToken' ||
    view === 'transactionsPeer' ||
    view === 'transactionsGeo' ||
    view === 'transactionsDao'
  );
};

Template.tally.onCreated(function () {
  Template.instance().feed = new ReactiveVar();
  Template.instance().contract = new ReactiveVar();
  Template.instance().openFeed = false;
  Template.instance().subscriptions = [];

  const instance = this;

  if (instance.data.placeholder) { return; }

  if (this.data.options.view === 'votes') {
    Meteor.call('getContract', this.data.options.keyword, function (error, result) {
      if (result) {
        instance.contract.set(result);
      } else if (error) {
        console.log(error);
      }
    });
  } else if (this.data.options.view === 'userVotes' || this.data.options.view === 'delegationVotes') {
    if (this.data.options.username) {
      Meteor.call('getUser', this.data.options.username, function (error, result) {
        if (result) {
          instance.contract.set(result);
        } else if (error) {
          console.log(error);
        }
      });
    } else if (this.data.options.userId) {
      instance.contract.set(Meteor.users.findOne({ _id: this.data.options.userId }));
    }
  } else if (_defaultTally(this.data.options.view)) {
    instance.openFeed = true;
  }

  this.subscription = instance.subscribe('tally', this.data.options);

  instance.autorun(function (computation) {
    const contract = instance.contract.get();
    let parameters;
    let dbQuery;
    let noTitle;

    if (contract || instance.openFeed) {
      if (instance.data.options.view === 'delegationVotes') {
        instance.openFeed = true;
      }
      parameters = query(Template.currentData().options);
      dbQuery = Transactions.find(parameters.find, parameters.options);
      noTitle = (Template.currentData().options.view === 'votes');
      if (contract) {
        Template.currentData().options.contractId = contract._id;
        Template.currentData().options.userId = contract._id;
      }
    }

    if (dbQuery) {
      if (instance.subscription.ready()) {
        Session.set('isLedgerReady', true);
        if (instance.data.options.view === 'userVotes' || instance.data.options.view === 'delegationVotes') {
          computation.stop();
        }
      }
      instance.handle = dbQuery.observeChanges({
        addedBefore: (id, fields) => {
          _buildFeed(id, fields, instance, contract, noTitle);
        },
      });
    }
  });
});

Template.tally.helpers({
  vote() {
    let feed = Template.instance().feed.get();
    feed = _.sortBy(feed, function (item) { return item.contract.timestamp * -1; });
    return feed;
  },
  ready() {
    return Session.get('isLedgerReady', true);
    // if (Template.instance().openFeed) { return true; }
    // return Template.instance().contract.get();
  },
  placeholderItem() {
    return [1, 2, 3];
  },
});

Template.tally.onDestroyed(function () {
  if (this.handle) {
    this.handle.stop();
  }
  if (this.subscription) {
    this.subscription.stop();
  }
});

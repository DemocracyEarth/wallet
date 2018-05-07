import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Meteor } from 'meteor/meteor';

import { query } from '/lib/views';
import { here } from '/lib/utils';
import { Transactions } from '/imports/api/transactions/Transactions';
import { Contracts } from '/imports/api/contracts/Contracts';
import { getUser } from '/imports/ui/templates/components/identity/avatar/avatar';

import '/imports/ui/templates/widgets/tally/tally.html';

/**
* @summary translates data info about vote into a renderable contracts
* @param {object} post a transaction Object
*/
const _voteToContract = (post, contract, hidePost) => {
  const transaction = {
    _id: post._id,
    contract: {
      _id: contract._id,
      timestamp: post.timestamp,
      wallet: {
        balance: post.input.quantity,
      },
      title: contract.title,
      url: contract.url,
    },
    ballot: post.condition.ballot,
    senderId: post.input.entityId,
    receiverId: post.output.entityId,
    isVote: true,
    hidePost,
    isRevoke: (post.input.entityType !== 'INDIVIDUAL'),
  };
  if (!hidePost) {
    let contractId;
    if (post.input.entityId === contract._id) {
      contractId = post.output.entityId;
    } else {
      contractId = post.input.entityId;
    }
    const dbContract = Contracts.findOne({ _id: contractId });
    if (dbContract) {
      transaction.contract = dbContract;
    }
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

Template.tally.onCreated(function () {
  Template.instance().feed = new ReactiveVar();
  Template.instance().contract = new ReactiveVar();

  const instance = this;
  if (Template.currentData().options.view === 'votes') {
    Meteor.call('getContract', Template.currentData().options.keyword, function (error, result) {
      if (result) {
        instance.contract.set(result);
      } else if (error) {
        console.log(error);
      }
    });
  } else if (Template.currentData().options.view === 'userVotes') {
    if (Template.currentData().options.username) {
      Meteor.call('getUser', Template.currentData().options.username, function (error, result) {
        if (result) {
          instance.contract.set(result);
        } else if (error) {
          console.log(error);
        }
      });
    } else if (Template.currentData().options.userId) {
      instance.contract.set(Meteor.users.findOne({ _id: Template.currentData().options.userId }));
    }
  }

  this.subscription = instance.subscribe('tally', Template.currentData().options);
});


Template.tally.onRendered(function () {
  const instance = this;
  instance.autorun(function () {
    const contract = instance.contract.get();

    if (contract) {
      Template.currentData().options.contractId = contract._id;
      Template.currentData().options.userId = contract._id;
      const parameters = query(Template.currentData().options);
      const dbQuery = Transactions.find(parameters.find, parameters.options);
      const noTitle = (Template.currentData().options.view === 'votes');

      instance.handle = dbQuery.observeChanges({
        addedBefore: (id, fields) => {
          // added stuff
          const currentFeed = instance.feed.get();
          const post = fields;
          post._id = id;
          const userSubscriptionId = _requiresUserSubscription(post);
          if (userSubscriptionId) {
            getUser(userSubscriptionId);
          }
          const voteContract = _voteToContract(post, contract, noTitle);
          if (!currentFeed) {
            instance.feed.set([voteContract]);
          } else if (!here(voteContract, currentFeed)) {
            currentFeed.push(voteContract);
            instance.feed.set(_.uniq(currentFeed));
          }
        },
      });
    }
  });
});

Template.tally.helpers({
  vote() {
    return Template.instance().feed.get();
  },
  ready() {
    return Template.instance().contract.get();
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

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { Meteor } from 'meteor/meteor';

import { query } from '/lib/views';
import { here } from '/lib/utils';
import { Transactions } from '/imports/api/transactions/Transactions';
import { displayNotice } from '/imports/ui/modules/notice';

import '/imports/ui/templates/widgets/tally/tally.html';

/**
* @summary checks if this transaction is a revoke
* @param {string} userId check if user exists
*/
const _isRevoke = (userId) => {
  return !Meteor.users.findOne({ _id: userId });
};

/**
* @summary translates data info about vote into a renderable contracts
* @param {object} post a transaction Object
*/
const _voteToContract = (post, contract) => {
  return {
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
    hidePost: true,
    isRevoke: _isRevoke(post.input.entityId),
  };
};

Template.tally.onCreated(function () {
  Template.instance().feed = new ReactiveVar();
  Template.instance().contract = new ReactiveVar();

  const instance = this;
  console.log(Template.currentData());
  if (Template.currentData().options.view === 'votes') {
    Meteor.call('getContract', Template.currentData().options.keyword, function (error, result) {
      if (result) {
        instance.contract.set(result);
      } else if (error) {
        console.log(error);
      }
    });
  } else if (Template.currentData().options.view === 'userVotes') {
    Meteor.call('getUser', Template.currentData().options.username, function (error, result) {
      if (result) {
        console.log(result);
        instance.contract.set(result);
      } else if (error) {
        console.log(error);
      }
    });
  }

  this.subscription = instance.subscribe('tally', Template.currentData().options);
});

Template.tally.onRendered(function () {
  const instance = this;
  instance.autorun(function () {
    console.log(instance);
    const contract = instance.contract.get();

    if (contract) {
      Template.currentData().options.contractId = contract._id;
      Template.currentData().options.userId = contract._id;
      const parameters = query(Template.currentData().options);
      const dbQuery = Transactions.find(parameters.find, parameters.options);

      instance.handle = dbQuery.observeChanges({
        addedBefore: (id, fields) => {
          // added stuff
          const currentFeed = instance.feed.get();
          const post = fields;
          post._id = id;
          const voteContract = _voteToContract(post, contract);
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

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { ReactiveVar } from 'meteor/reactive-var';
import { getDelegationContract } from '/imports/startup/both/modules/Contract';

import '/imports/ui/templates/components/identity/card/card.html';
import '/imports/ui/templates/components/identity/avatar/avatar.js';

Template.card.onCreated(function () {
  Template.instance().delegationContract = new ReactiveVar();
});

Template.card.onRendered(function () {
  const instance = this;

  instance.autorun(function () {
    const subscription = instance.subscribe('singleDelegation', { view: 'singleDelegationContract', delegateId: instance.data.toString() });
    if (subscription.ready()) {
      instance.delegationContract = getDelegationContract(Meteor.userId(), this._id);
    }
  });
});

Template.card.helpers({
  myself() {
    return (this.toString() === Meteor.userId() || this._id === '0000000');
  },
  voteSettings() {
    return {
      voteId: `vote-${Meteor.userId()}-${this.toString()}`,
      wallet: Meteor.user().profile.wallet,
      sourceId: Meteor.userId(),
      targetId: this.toString(),
    };
  },
  contract() {
    return Template.instance().delegationContract.get();
  },
  profile() {
    const userId = this.toString();
    return {
      balanceId: `vote-user-balance-${userId}`,
      targetId: userId,
      wallet: Meteor.users.findOne({ _id: userId }).profile.wallet,
    };
  },
});

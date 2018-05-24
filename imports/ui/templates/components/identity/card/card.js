import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { ReactiveVar } from 'meteor/reactive-var';
import { getDelegationContract } from '/imports/startup/both/modules/Contract';
import { updateUserCache } from '/imports/api/transactions/transaction';

import '/imports/ui/templates/components/identity/card/card.html';
import '/imports/ui/templates/components/identity/avatar/avatar.js';
import '/imports/ui/templates/widgets/spinner/spinner.js';

Template.card.onCreated(function () {
  Template.instance().senderDelegationContract = new ReactiveVar();
  Template.instance().receiverDelegationContract = new ReactiveVar();
  Template.instance().displayDelegation = new ReactiveVar(false);
});

Template.card.onRendered(function () {
  const instance = this;

  instance.autorun(function () {
    const subscription = instance.subscribe('delegationContracts', { view: 'bothDelegationContracts', delegateId: instance.data.toString() });
    if (subscription.ready()) {
      const sent = getDelegationContract(Meteor.userId(), instance.data.toString());
      const received = getDelegationContract(instance.data.toString(), Meteor.userId());
      console.log(sent);
      console.log(received);
      instance.senderDelegationContract.set(sent);
      instance.receiverDelegationContract.set(received);
      const transactions = instance.subscribe('delegations', { view: 'delegationTransactions', items: [sent._id, received._id] });
      if (transactions.ready()) {
        instance.displayDelegation.set(true);
      }
    }
  });
});

Template.card.helpers({
  myself() {
    return (this.toString() === Meteor.userId() || this._id === '0000000');
  },
  voteSettings() {
    return {
      voteId: `vote-${Meteor.userId()}-${Template.instance().senderDelegationContract.get()._id}`,
      wallet: Meteor.user().profile.wallet,
      sourceId: Meteor.userId(),
      targetId: Template.instance().senderDelegationContract.get()._id, // this.toString(),
    };
  },
  displayDelegation() {
    return Template.instance().displayDelegation.get();
  },
  delegationContract() {
    const sender = Template.instance().senderDelegationContract.get();
    const receiver = Template.instance().receiverDelegationContract.get();
    return {
      contractSender: sender,
      contractReceiver: receiver,
      senderId: sender.signatures[0]._id,
      receiverId: sender.signatures[1]._id,
      voteId: `vote-${Meteor.userId()}-${sender._id}`,
    };
  },
  profile() {
    let id;
    const userId = this.toString();
    const userWallet = Meteor.users.findOne({ _id: userId }).profile.wallet;
    if (userId === Meteor.userId()) {
      id = 'vote-user-balance';
    } else {
      id = `vote-user-balance-${userId}`;
      if (userWallet) {
        updateUserCache(id, userId, userWallet);
      }
    }
    return {
      balanceId: id,
      targetId: userId,
      wallet: userWallet,
    };
  },
  spinnerId() {
    return `card-${Meteor.userId()}-${this.toString()}`;
  },
  spinnerStyle() {
    return `height: 20px;
            color: #fff;
            margin-top: 25px;
            margin-left: 0px;
            width: 100%;`;
  },
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { ReactiveVar } from 'meteor/reactive-var';
import { getDelegationContract } from '/imports/startup/both/modules/Contract';

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
      instance.senderDelegationContract.set(sent);
      instance.receiverDelegationContract.set(received);
      console.log(`received: `);
      console.log(received);
      console.log(`sent: `);
      console.log(sent);
      console.log(`targetId = ${instance.toString()}`);
      console.log(instance.data);
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
      voteId: `vote-${Meteor.userId()}-${Template.instance().receiverDelegationContract.get()._id}`,
      wallet: Meteor.user().profile.wallet,
      sourceId: Meteor.userId(),
      targetId: this.toString(),
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
      voteId: `vote-${Meteor.userId()}-${receiver._id}`,
    };
  },
  profile() {
    const userId = this.toString();
    return {
      balanceId: `vote-user-balance-${userId}`,
      targetId: userId,
      wallet: Meteor.users.findOne({ _id: userId }).profile.wallet,
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

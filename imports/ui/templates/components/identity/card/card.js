import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { ReactiveVar } from 'meteor/reactive-var';
import { getDelegationContract } from '/imports/startup/both/modules/Contract';

import '/imports/ui/templates/components/identity/card/card.html';
import '/imports/ui/templates/components/identity/avatar/avatar.js';
import '/imports/ui/templates/widgets/spinner/spinner.js';

Template.card.onCreated(function () {
  Template.instance().delegationContract = new ReactiveVar();
  Template.instance().displayDelegation = new ReactiveVar(false);
});

Template.card.onRendered(function () {
  const instance = this;

  instance.autorun(function () {
    const subscription = instance.subscribe('singleDelegation', { view: 'sentDelegation', delegateId: instance.data.toString() });
    if (subscription.ready()) {
      console.log(`asking for delegation contract of this._id ${instance.data.toString()}`)
      const delegationContract = getDelegationContract(Meteor.userId(), instance.data.toString());
      console.log(`delegationContract is ${delegationContract._id}`)
      console.log(`delegationContract alternative is ${getDelegationContract(instance.data.toString(), Meteor.userId())._id}`)
      instance.delegationContract.set(delegationContract);
      const transactions = instance.subscribe('transaction', { view: 'contractVotes', contractId: delegationContract._id });
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
      voteId: `vote-${Meteor.userId()}-${Template.instance().delegationContract.get()._id}`,
      wallet: Meteor.user().profile.wallet,
      sourceId: Meteor.userId(),
      targetId: this.toString(),
    };
  },
  displayDelegation() {
    return Template.instance().displayDelegation.get();
  },
  delegationContract() {
    const contract = Template.instance().delegationContract.get();
    let senderId;
    let receiverId;
    if (contract) {
      if (contract.signatures[0]._id === Meteor.userId()) {
        senderId = contract.signatures[0]._id;
        receiverId = contract.signatures[1]._id;
      } else {
        senderId = contract.signatures[1]._id;
        receiverId = contract.signatures[0]._id;
      }
      return {
        contract,
        senderId,
        receiverId,
        voteId: `vote-${Meteor.userId()}-${contract._id}`,
      };
    }
    return undefined;
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

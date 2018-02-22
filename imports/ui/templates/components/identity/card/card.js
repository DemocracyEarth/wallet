import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import { ReactiveVar } from 'meteor/reactive-var';
import { getDelegationContract } from '/imports/startup/both/modules/Contract';

import '/imports/ui/templates/components/identity/card/card.html';
import '/imports/ui/templates/components/identity/avatar/avatar.js';
import '/imports/ui/templates/widgets/spinner/spinner.js';

Template.card.onCreated(function () {
  Template.instance().delegationContract = new ReactiveVar();
});

Template.card.onRendered(function () {
  const instance = this;

  instance.autorun(function () {
    const subscription = instance.subscribe('singleDelegation', { view: 'sentDelegation', delegateId: instance.data.toString() });
    if (subscription.ready()) {
      instance.delegationContract.set(getDelegationContract(Meteor.userId(), this._id));
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

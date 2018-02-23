import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { getVotes } from '/imports/api/transactions/transaction';

import '/imports/ui/templates/widgets/transaction/transaction.html';

Template.transaction.onCreated(function () {
  Template.instance().totalVotes = new ReactiveVar(0);
});

Template.transaction.helpers({
  sender() {
    return {
      _id: this.senderId,
      imgStyle: () => {
        if (this.compressed) {
          return 'float: left; margin-top: 4px;';
        }
        return '';
      },
    };
  },
  receiver() {
    return {
      _id: this.receiverId,
      imgStyle: () => {
        if (this.compressed) {
          return ' margin-top: 4px; margin-left: 5px; ';
        }
        return '';
      },
    };
  },
  value() {
    let votes;
    if (this.editable) {
      votes = Session.get(this.voteId).allocateQuantity;
      if (isNaN(votes)) { votes = Session.get(this.voteId).inBallot; }
      Template.instance().totalVotes.set(votes);
    } else {
      Template.instance().totalVotes.set(getVotes(this.contract._id, this.senderId));
      votes = Template.instance().totalVotes.get();
    }
    if (votes === 1) {
      return `${votes} ${TAPi18n.__('vote')}`;
    } else if (votes > 0) {
      return `${votes} ${TAPi18n.__('votes')}`;
    }
    return TAPi18n.__('no-delegated-votes');
  },
  source() {
    return TAPi18n.__('delegated-votes');
  },
  voteStyle() {
    if (Template.instance().totalVotes.get() > 0) {
      return 'stage stage-finish-approved';
    }
    return 'stage stage-live';
  },
  emptyVotes() {
    // TODO: this data should be from ledger
    if (this.contract.wallet.available === 0) {
      // return 'display:none';
    }
    return '';
  },
  onCard() {
    if (this.onCard) {
      return 'vote-delegation-card';
    }
    return '';
  },
});

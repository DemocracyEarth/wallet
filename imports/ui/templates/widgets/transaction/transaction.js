import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { stripHTMLfromText } from '/imports/ui/modules/utils';
import { Meteor } from 'meteor/meteor';

import { getVotes } from '/imports/api/transactions/transaction';
import { timeCompressed } from '/imports/ui/modules/chronos';

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
  isVote() {
    return this.isVote;
  },
  value() {
    let votes;
    if (this.isVote) {
      votes = this.contract.wallet.balance;
      if (this.isRevoke) {
        votes *= -1;
      }
      Template.instance().totalVotes.set(votes);
    } else if (this.editable) {
      if (Session.get(this.voteId)) {
        votes = Session.get(this.voteId).allocateQuantity;
        if (isNaN(votes)) { votes = Session.get(this.voteId).inBallot; }
        Template.instance().totalVotes.set(votes);
      }
    } else {
      Template.instance().totalVotes.set(getVotes(this.contract._id, this.senderId));
      votes = Template.instance().totalVotes.get();
    }
    if (votes === 1 || votes === -1) {
      return `${votes} ${TAPi18n.__('vote')}`;
    } else if (votes > 0 || votes < 0) {
      return `${votes} ${TAPi18n.__('votes')}`;
    }
    return TAPi18n.__('no-delegated-votes');
  },
  source() {
    return TAPi18n.__('delegated-votes');
  },
  voteStyle() {
    if (Template.instance().totalVotes.get() !== 0) {
      if (this.isRevoke) {
        return 'stage stage-finish-rejected';
      }
      return 'stage stage-finish-approved';
    }
    return 'stage stage-live';
  },
  ballotOption() {
    return TAPi18n.__(this.ballot[0].mode);
  },
  emptyVotes() {
    if (Template.instance().totalVotes.get() === 0 && !this.onCard) {
      return 'display:none';
    }
    return '';
  },
  sinceDate() {
    return `${timeCompressed(this.contract.timestamp)}`;
  },
  noDate() {
    return this.noDate;
  },
  onCard() {
    if (this.onCard) {
      return 'vote-delegation-card';
    }
    return '';
  },
  isRevoke() {
    return this.isRevoke;
  },
  hidePost() {
    return this.hidePost;
  },
  displayTitle() {
    let chars = 30;
    if (Meteor.Device.isPhone()) {
      chars = 15;
    }
    return `${stripHTMLfromText(this.contract.title).substring(0, chars)}...`;
  },
  fullTitle() {
    return stripHTMLfromText(this.contract.title);
  },
});

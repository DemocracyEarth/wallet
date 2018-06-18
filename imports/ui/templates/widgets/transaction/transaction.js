import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import { getVotes } from '/imports/api/transactions/transaction';
import { timeCompressed } from '/imports/ui/modules/chronos';

import '/imports/ui/templates/widgets/transaction/transaction.html';
import '/imports/ui/templates/widgets/preview/preview.js';

const _verifySubsidy = (id) => {
  return (Meteor.settings.public.Collective._id === id);
};

Template.transaction.onCreated(function () {
  Template.instance().totalVotes = new ReactiveVar(0);
});

Template.transaction.helpers({
  sender() {
    const helper = this;
    if (this.missingSender) {
      Meteor.call('getOtherDelegate', this.missingContractId, this.missingCounterPartyId, function (error, result) {
        if (result) {
          helper.senderId = result._id;
        } else if (error) {
        }
      });
    }
    return {
      _id: helper.senderId,
      imgStyle: () => {
        if (helper.compressed) {
          return 'float: left; margin-top: 4px;';
        }
        return '';
      },
    };
  },
  receiver() {
    const helper = this;
    if (this.missingReceiver) {
      Meteor.call('getOtherDelegate', this.missingContractId, this.missingCounterPartyId, function (error, result) {
        if (result) {
          helper.receiverId = result._id;
        } else if (error) {
          console.log(error);
        }
      });
    }
    return {
      _id: helper.receiverId,
      imgStyle: () => {
        if (helper.compressed) {
          return ' margin-top: 4px; margin-left: 5px; ';
        }
        return '';
      },
    };
  },
  isSubsidy() {
    return _verifySubsidy(this.senderId);
  },
  isVote() {
    return this.isVote;
  },
  value() {
    let votes;
    let plus = '';
    if (this.isVote) {
      votes = this.contract.wallet.balance;
      if (_verifySubsidy(this.senderId)) {
        plus = '+';
      } else if (this.isRevoke) {
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
      return `${plus}${votes} ${TAPi18n.__('vote')}`;
    } else if (votes > 0 || votes < 0) {
      return `${plus}${votes} ${TAPi18n.__('votes')}`;
    }
    if (this.isVote) {
      return TAPi18n.__('choice-swap');
    }
    return TAPi18n.__('no-delegated-votes');
  },
  source() {
    return TAPi18n.__('delegated-votes');
  },
  voteStyle() {
    let style;
    if (Template.instance().totalVotes.get() !== 0) {
      if (_verifySubsidy(this.senderId)) {
        style = 'stage stage-vote-totals';
      } else if (this.isRevoke) {
        style = 'stage stage-finish-rejected';
      } else {
        style = 'stage stage-finish-approved';
      }
    } else {
      style = 'stage stage-live';
    }
    if (this.compressed) {
      style += ' stage-compressed';
    }
    return style;
  },
  ballotOption() {
    if (this.ballot) {
      return TAPi18n.__(this.ballot[0].mode);
    }
    return '';
  },
  emptyVotes() {
    if (Template.instance().totalVotes.get() === 0 && !this.onCard && !this.isVote) {
      // return 'display:none';
    }
    return '';
  },
  sinceDate() {
    return `${timeCompressed(this.contract.timestamp)}`;
  },
  noDate() {
    return this.noDate;
  },
  loosing() {
    if (!this.winningBallot) {
      return 'stage-loosing';
    }
    return '';
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
  revokeStyle() {
    if (!this.hidePost) { return 'stage-revoke'; } return '';
  },
});

Template.collectivePreview.helpers({
  flag() {
    return Meteor.settings.public.Collective.profile.logo;
  },
  name() {
    let chars = 30;
    if (Meteor.Device.isPhone()) {
      chars = 15;
    }
    if (Meteor.settings.public.Collective.name.length > chars) {
      return `${Meteor.settings.public.Collective.name.substring(0, chars)}...`;
    }
    return Meteor.settings.public.Collective.name;
  },
  url() {
    return '/';
  },
});

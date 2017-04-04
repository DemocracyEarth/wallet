import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';

import { voteComment } from '/imports/ui/modules/Thread';
import { Vote } from '/imports/ui/modules/Vote';

import { timeSince } from '/imports/ui/modules/chronos';
import { textFormat } from '/imports/ui/modules/utils';

import './thread.html';
import '../../../identity/avatar/avatar.js';
import '../postComment.js';

const replyBoxes = [];

/**
* @summary counts the votes in a comment
* @param {object} votes from event object in contract
*/
function count(votes) {
  let total = 0;
  for (const i in votes) {
    total += votes[i].quantity;
  }
  return total;
}

/**
* @summary verifies if user has voted on a comment
* @param {object} votes from event object in contract
* @param {boolean} up if its an upvote or downvote
*/
function check(votes, up) {
  for (const i in votes) {
    if (votes[i].userId === Meteor.userId()) {
      if ((up && votes[i].quantity > 0) || (!up && votes[i].quantity < 0)) {
        return true;
      }
    }
  }
  return false;
}

Template.thread.helpers({
  timestamp() {
    return timeSince(this.timestamp);
  },
  noChildren() {
    if (this.children === undefined || this.children.length <= 0) {
      return 'no-children';
    }
    return '';
  },
  reply() {
    const replyStringId = `replybox${this.id}`;
    if (!Session.get(replyStringId)) {
      return false;
    }
    return true;
  },
  content() {
    return textFormat(this.content);
  },
  settingRanking() {
    if (Meteor.settings.public.app.config.commentRanking === false) {
      return false;
    }
    return true;
  },
  sortTotal() {
    return count(this.votes);
  },
  label() {
    if (count(this.votes) !== 1) {
      return TAPi18n.__('votes');
    }
    return TAPi18n.__('vote');
  },
  upvote() {
    this.userUpvoted = false;
    if (check(this.votes, true)) {
      this.userUpvoted = true;
      return `${Router.path('home')}images/upvote-active.png`;
    } else if (Meteor.user().profile.wallet.available <= 0) {
      return `${Router.path('home')}images/upvote-disabled.png`;
    }
    return `${Router.path('home')}images/upvote.png`;
  },
  downvote() {
    this.userDownvoted = false;
    if (check(this.votes, false)) {
      this.userDownvoted = true;
      return `${Router.path('home')}images/downvote-active.png`;
    } else if (Meteor.user().profile.wallet.available <= 0) {
      return `${Router.path('home')}images/downvote-disabled.png`;
    }
    return `${Router.path('home')}images/downvote.png`;
  },
  buttonStatus() {
    if ((Meteor.user().profile.wallet.available <= 0) || (this.userId === Meteor.userId())) {
      return 'sort-button-disabled';
    }
    return '';
  },
  buttonRule(upvote) {
    if (check(this.votes, upvote)) {
      return TAPi18n.__('sort-button-voted');
    } else if (Meteor.user().profile.wallet.available <= 0) {
      return TAPi18n.__('sort-button-disabled');
    } else if (upvote) {
      return TAPi18n.__('sort-button-delegate');
    }
    return TAPi18n.__('sort-button-punish');
  },
});

Template.thread.events({
  'click #replyToThread'() {
    const replyStringId = `replybox${this.id}`;
    if (replyBoxes.length > 0) {
      for (let i = 0; i <= replyBoxes.length; i += 1) {
        if (replyBoxes[i] !== replyStringId) {
          Session.set(replyBoxes[i], false);
          const index = replyBoxes.indexOf(replyBoxes[i]);
          if (index > -1) { replyBoxes.splice(index, 1); }
        }
      }
    }
    replyBoxes.push(replyStringId);
    Session.set(replyStringId, true);
  },
  'click #upvote'() {
    // transact
    console.log(this.userId);
    const vote = new Vote(Meteor.user().profile.wallet, this.userId);
    vote.place(parseInt(vote.inBallot + 1, 10), true);
    if (vote.execute()) {
      voteComment(Session.get('contract')._id, this.id, 1);
    }
    // microdelegation(event, this, true);
  },
  'click #downvote'(event) {
    // microdelegation(event, this, false);
  },
});

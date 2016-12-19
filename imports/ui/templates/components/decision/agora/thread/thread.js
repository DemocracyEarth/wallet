import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';

import { displayLogin } from '/imports/ui/modules/popup';
import { voteComment } from '/imports/ui/modules/Thread';

import { timeSince } from '/imports/ui/modules/chronos';
import { textFormat } from '/imports/ui/modules/utils';

import './thread.html';
import '../../../identity/avatar/avatar.js';
import '../postComment.js';

const replyBoxes = [];
let voteEventId = 0;

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
function userVoted(votes, up) {
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
  upvote() {
    if (userVoted(this.votes, true)) {
      return `${Router.path('home')}images/upvote-active.png`;
    }
    return `${Router.path('home')}images/upvote.png`;
  },
  downvote() {
    if (userVoted(this.votes, false)) {
      return `${Router.path('home')}images/downvote-active.png`;
    }
    return `${Router.path('home')}images/downvote.png`;
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
  'click #upvote'(event) {
    if (!Meteor.user()) {
      displayLogin(event, document.getElementById('loggedUser'));
    } else if (this.id !== voteEventId) {
      voteEventId = this.id;
      voteComment(
        Session.get('contract')._id,
        this.id,
        1
      );
    }
  },
  'click #downvote'() {
    if (!Meteor.user()) {
      displayLogin(event, document.getElementById('loggedUser'));
    } else if (this.id !== voteEventId) {
      voteEventId = this.id;
      voteComment(
        Session.get('contract')._id,
        this.id,
        -1
      );
    }
  },
});

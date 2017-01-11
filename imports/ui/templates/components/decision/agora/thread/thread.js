import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';

import { displayLogin } from '/imports/ui/modules/popup';
import { voteComment } from '/imports/ui/modules/Thread';
import { startDelegation } from '/imports/startup/both/modules/Contract';
import { transact } from '/imports/api/transactions/transaction';
import { convertToSlug } from '/lib/utils';


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

/**
* @summary executes upvote or downvote
* @param {object} event event from ui
* @param {object} comment object with comment metadata
* @param {number} quantity quantity of votes (1 or -1 usually)
* @param {string} mode either VOTE, SWITCH or REMOVE
*/
function vote(event, comment, quantity, mode) {
  if (!Meteor.user()) {
    // not logged
    displayLogin(event, document.getElementById('loggedUser'));
    return;
  }
  switch (mode) {
    case 'SWITCH':
      console.log('switching...');
      if (quantity > 0 && comment.userDownvoted === true) {
        // Remove current downvote first
        voteComment(Session.get('contract')._id, comment.id, -1, true);
        // Then switch to an upvote
        voteComment(Session.get('contract')._id, comment.id, 1, false);
      } else if (quantity < 0 && comment.userUpvoted === true) {
        // Remove current upvote first
        voteComment(Session.get('contract')._id, comment.id, 1, true);
        // Then switch to a downvote
        voteComment(Session.get('contract')._id, comment.id, -1, false);
      }
      break;
    case 'REMOVE':
      console.log('removing...');
      if ((quantity > 0 && comment.userUpvoted === true)
      || (quantity < 0 && comment.userDownvoted === true)) {
        voteComment(Session.get('contract')._id, comment.id, quantity, true);
      }
      break;
    default: {
      console.log('voting...');
      if ((quantity > 0 && comment.userUpvoted === false)
      || (quantity < 0 && comment.userDownvoted === false)) {
        voteComment(Session.get('contract')._id, comment.id, quantity, false);
        // transact(Meteor.userId(), Session.get('contract')._id, Math.abs(quantity));
        const delegate = Meteor.users.findOne({ _id: comment.userId }).username;
        const keywordTitle = `${convertToSlug(Meteor.user().username)}-${convertToSlug(delegate)}`;
        console.log(`making delegation: ${keywordTitle}`);
        // TODO: if its upvote, one way; if its downvote the other way.
        startDelegation(
          Meteor.userId(),
          comment.userId,
          {
            title: keywordTitle,
            signatures: [
              {
                username: Meteor.user().username,
              },
              {
                username: delegate,
              },
            ],
          },
          true
        );
        break;
      }
    }
  }
}

/**
* @summary process upvote/downvote event
* @param {object} event event from ui
* @param {object} comment object with comment metadata
* @param {boolean} up if its upvote or downvote
*/
function microdelegation(event, comment, up) {
  if (Meteor.userId() === comment.userId) {
    console.log('SAME user');
  } else if (comment.userDownvoted && !up) {
    vote(event, comment, -1, 'REMOVE');
  } else if (comment.userUpvoted && up) {
    vote(event, comment, 1, 'REMOVE');
  } else if (comment.userUpvoted && !up) {
    vote(event, comment, -1, 'SWITCH');
  } else if(comment.userDownvoted && up) {
    vote(event, comment, 1, 'SWITCH');
  } else if (!up) {
    vote(event, comment, -1, 'VOTE');
  } else {
    vote(event, comment, 1, 'VOTE');
  }
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
  buttonStatus(upvote) {
    if (check(this.votes, upvote)) {
      return '';
    } else if (Meteor.user().profile.wallet.available <= 0) {
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
  'click #upvote'(event) {
    event.stopPropagation(); // Prevents multiple updates to children and grandchildren
    microdelegation(event, this, true);
  },
  'click #downvote'(event) {
    event.stopPropagation();
    microdelegation(event, this, false);
  },
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { displayLogin } from '/imports/ui/modules/popup';
import { voteComment } from '/imports/ui/modules/Thread';

import { timeSince } from '/imports/ui/modules/chronos';
import { textFormat } from '/imports/ui/modules/utils';

import './thread.html';
import '../../../identity/avatar/avatar.js';
import '../postComment.js';

const replyBoxes = [];

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
  'mousedown #upvote'(event) {
    if (!Meteor.user()) {
      displayLogin(event, document.getElementById('loggedUser'));
    }else {
      voteComment(
        Session.get('contract')._id,
        this.id,
        1
      );
    }
  },
  'mousedown #downvote'() {
    if (!Meteor.user()) {
      displayLogin(event, document.getElementById('loggedUser'));
    }else {
      voteComment(
        Session.get('contract')._id,
        this.id,
        -1
      );
    }
  },
});

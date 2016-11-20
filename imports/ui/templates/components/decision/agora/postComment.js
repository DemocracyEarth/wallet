import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { postComment } from '/imports/ui/modules/Thread';

import './postComment.html';
import '../../identity/avatar/avatar.js';

let commentBox;

function cleanCommentBox() {
  $('#postComment').attr('active', false);
  $('#postComment').attr('class', 'comment comment-post comment-disabled');
  document.getElementById('postComment').innerText = TAPi18n.__('argue');
}

Template.postComment.onRendered(function render() {
  commentBox = this.lastNode.firstChild.nextElementSibling;
  if (commentBox.innerText !== TAPi18n.__('argue')) {
    commentBox.focus();
  }
});

Template.postComment.events({
  'keypress #postComment'(event) {
    if (event.which === 13 && !event.shiftKey) {
      event.preventDefault();
      if (!this.replyMode) {
        postComment(
          Session.get('contract')._id,
          {
            userId: Meteor.userId(),
            action: 'COMMENT',
            content: document.getElementById('postComment').innerText,
            sort: [],
            sortTotal: 0,
          }
        );
        cleanCommentBox();
        event.target.blur();
      } else {
        postComment(
          Session.get('contract')._id,
          {
            userId: Meteor.userId(),
            action: 'COMMENT',
            content: commentBox.innerText,
            sort: [],
            sortTotal: 0,
            children: [],
          },
          event.target.getAttribute('name')
        );
        Session.set(`replybox${this.id}`, false);
      }
    }
  },
  'click #postComment'() {
    if (!this.replyMode) {
      if ($('#postComment').attr('active') === 'false') {
        $('#postComment').attr('active', true);
        $('#postComment').attr('class', 'comment comment-post');
        document.getElementById('postComment').innerText = '';
      }
    }
  },
  'blur #postComment'() {
    if (!this.replyMode) {
      if (document.getElementById('postComment').innerText === '') {
        cleanCommentBox();
      }
    } else {
      Session.set(`replybox${this.id}`, false);
    }
  },
});

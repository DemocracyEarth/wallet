import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import './feed.html';
import './feedItem.js';
import './feedEmpty.js';

Template.feed.rendered = function rendered() {
  Session.set('editorMode', false);
  Session.set('voterMode', false);
  if ($('.right').scrollTop() > 0) {
    $('.right').animate({ scrollTop: 0 });
  }
};

Template.feed.helpers({
  item: function () {
    if (Session.get('feed').length == 0) {
      Session.set('emptyFeed', true);
    } else {
      Session.set('emptyFeed', false);
    }
    return Session.get('feed');
  },
  emptyFeed: function () {
    return Session.get('emptyFeed');
  },
  emptyContent: function () {
    return Session.get('emptyContent');
  },
  editorMode: function () {
    return Session.get('feedEditorMode');
  },
  voterMode: function () {
    return Session.get('feedVoterMode');
  }
});

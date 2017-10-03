import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { createContract } from '/imports/startup/both/modules/Contract';

import './feed.html';
import './feedItem.js';
import './feedEmpty.js';

Template.feed.onRendered(() => {
  Session.set('editorMode', false);
  Session.set('voterMode', false);
  if ($('.right').scrollTop() > 0) {
    $('.right').animate({ scrollTop: 0 });
  }
});

Template.feed.helpers({
  item() {
    if (Session.get('feed').length === 0) {
      Session.set('emptyFeed', true);
    } else {
      Session.set('emptyFeed', false);
    }
    return Session.get('feed');
  },
  emptyFeed() {
    return Session.get('emptyFeed');
  },
  emptyContent() {
    return Session.get('emptyContent');
  },
  editorMode() {
    return Session.get('feedEditorMode');
  },
  voterMode() {
    return Session.get('feedVoterMode');
  },
  newContract() {
    return createContract();
  },
});

Template.feed.events({
  'click #feed-bottom'() {
    $('.right').animate({ scrollTop: 0 });
  },
});

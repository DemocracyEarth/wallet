import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { Router } from 'meteor/iron:router';
import { Contracts } from '/imports/api/contracts/Contracts';

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
    if (this.length === 0) {
      Session.set('emptyFeed', true);
    } else {
      Session.set('emptyFeed', false);
    }
    return this.feed;
  },
  emptyFeed() {
    return Session.get('emptyFeed');
  },
  emptyContent() {
    return Session.get('emptyContent');
  },
  editorMode() {
    return Session.get('showPostEditor');
  },
  voterMode() {
    return Session.get('feedVoterMode');
  },
  newContractId() {
    return Session.get('draftContract')._id;
  },
});

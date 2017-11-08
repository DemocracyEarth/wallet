import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import { Contracts } from '/imports/api/contracts/Contracts';

import './feed.html';
import './feedItem.js';
import './feedEmpty.js';


Template.feed.onCreated(function () {
  Template.instance().feed = new ReactiveVar(Contracts.find(Template.currentData().query, { sort: Template.currentData().sort, skip: Template.currentData().skip, limit: Template.currentData().limit }).fetch());
});

Template.feed.helpers({
  item() {
    const feed = Template.instance().feed.get();
    console.log(feed);
    if (feed.length === 0) {
      Session.set('emptyFeed', true);
    } else {
      Session.set('emptyFeed', false);
    }
    return feed;
  },
  emptyFeed() {
    return Session.get('emptyFeed');
  },
  emptyContent() {
    return Session.get('emptyContent');
  },
});

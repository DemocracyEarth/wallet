import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { Router } from 'meteor/iron:router';
import { Contracts } from '/imports/api/contracts/Contracts';

import './feed.html';
import './feedItem.js';
import './feedEmpty.js';

Template.feed.onRendered(function () {
  Session.set('editorMode', false);
  Session.set('voterMode', false);
  /* if ($('.right').scrollTop() > 0) {
    $('.right').animate({ scrollTop: 0 });
  }*/
});

Template.feed.helpers({
  item() {
    const feed = Contracts.find({ collectiveId: Meteor.settings.public.Collective._id, stage: this.stage, kind: this.kind }, { sort: { createdAt: -1 }, skip: this.skip, limit: this.limit }).fetch();
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

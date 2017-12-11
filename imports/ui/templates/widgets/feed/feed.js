import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { gui } from '/lib/const';
import { query } from '/lib/views';
import { Contracts } from '/imports/api/contracts/Contracts';

import './feed.html';
import './feedItem.js';
import './feedEmpty.js';
import './feedLoad.js';

/**
* @summary remove delegations without votes left
* @param {object} feed the query from db
*/
const _sanitize = (feed) => {
  return _.filter(feed, (value) => { return ((value.kind === 'DELEGATION' && value.wallet.available > 0) || (value.kind !== 'DELEGATION')); });
};

Template.feed.onCreated(function () {
  Template.instance().count = new ReactiveVar(0);
  Template.instance().feed = new ReactiveVar();
  Template.instance().refresh = new ReactiveVar(false);

  const instance = this;

  instance.autorun(function () {
    const subscription = instance.subscribe('feed', Template.currentData().options);
    const count = instance.subscribe('feedCount', Template.currentData().options);
    const parameters = query(Template.currentData().options);

    // verify if beginning
    const beginning = (Template.currentData().options.skip === 0);
    if (beginning) { $('.right').scrollTop(0); }
    instance.refresh.set(beginning);

    // total items on the feed
    if (count.ready()) {
      instance.count.set(Counts.get('feedItems'));
      console.log(Counts.get('feedItems'));
    }

    // feed content
    if (subscription.ready()) {
      const feed = Contracts.find(parameters.find, parameters.options);
      console.log(feed.fetch());
      instance.feed.set(_sanitize(feed.fetch()));
      instance.refresh.set(false);
    }
  });
});

Template.feed.helpers({
  item() {
    return Template.instance().feed.get();
  },
  refresh() {
    return Template.instance().refresh.get();
  },
  beginning() {
    return (Template.currentData().options.skip === 0);
  },
  emptyContent() {
    return Session.get('emptyContent');
  },
  count() {
    return Template.instance().count.get();
  },
  placeholderItem() {
    return [1, 2, 3, 4, 5];
  },
});

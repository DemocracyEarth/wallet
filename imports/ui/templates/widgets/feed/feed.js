import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import { Contracts } from '/imports/api/contracts/Contracts';

import './feed.html';
import './feedItem.js';
import './feedEmpty.js';

/**
* @summary remove delegations without votes left
* @param {object} feed the query from db
*/
const _sanitize = (feed) => {
  return _.filter(feed, (value) => { return ((value.kind === 'DELEGATION' && value.wallet.available > 0) || (value.kind !== 'DELEGATION')); });
};

Template.feed.onCreated(function () {
  Template.instance().count = new ReactiveVar(0);

  const instance = this;

  Meteor.call('feedCount', Template.currentData().query, {}, (error, result) => {
    if (!error) {
      instance.count.set(result);
    }
  });

  /*Template.currentData().options = {
    view: Template.currentData().view,
    skip: Template.currentData().skip,
    limit: Template.currentData().limit,
  };*/

  instance.autorun(function () {
    console.log('calling...')
    instance.subscribe('feed', Template.currentData().options);
  });
});

Template.feed.helpers({
  item() {
    const feed = Contracts.find(Template.currentData().query, Template.currentData().options);
    return _sanitize(feed.fetch());
  },
  emptyContent() {
    return Session.get('emptyContent');
  },
  count() {
    return Template.instance().count.get();
  },
});

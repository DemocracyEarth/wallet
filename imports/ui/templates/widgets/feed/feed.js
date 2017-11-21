import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

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
  return feed;
  return _.filter(feed, (value) => { return ((value.kind === 'DELEGATION' && value.wallet.available > 0) || (value.kind !== 'DELEGATION')); });
};

Template.feed.onCreated(function () {
  Template.instance().count = new ReactiveVar(0);
  Template.instance().feed = new ReactiveVar();

  const instance = this;

  instance.autorun(function () {
    const subscription = instance.subscribe('feed', Template.currentData().options);
    const data = Template.currentData();

    if (subscription.ready()) {
      const feed = Contracts.find(Template.currentData().query, Template.currentData().options);
      Meteor.call('feedCount', Template.currentData().query, {}, function (error, result) {
        if (!error) {
          instance.count.set(result);
          instance.feed.set(_sanitize(feed.fetch()));
          console.log(data.options);
          console.log(`READY: feed has ${result} items`);
        }
      });
    } else {
      console.log('NOT READY');
    }
  });
});

Template.feed.helpers({
  item() {
    return Template.instance().feed.get();
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
});

import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

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
  const instance = this;

  instance.autorun(function () {
    instance.subscribe('feed', {
      view: Template.currentData().view,
      skip: Template.currentData().skip,
      limit: Template.currentData().limit,
    });
  });
});

Template.feed.helpers({
  item() {
    return _sanitize(Contracts.find().fetch());
  },
  emptyContent() {
    return Session.get('emptyContent');
  },
});

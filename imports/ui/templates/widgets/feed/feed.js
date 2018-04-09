import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { query } from '/lib/views';
import { Contracts } from '/imports/api/contracts/Contracts';
import { createContract } from '/imports/startup/both/modules/Contract';

import '/imports/ui/templates/widgets/feed/feed.html';
import '/imports/ui/templates/widgets/feed/feedItem.js';
import '/imports/ui/templates/widgets/feed/feedEmpty.js';
import '/imports/ui/templates/widgets/feed/feedLoad.js';


/**
* @summary if _here
* @param {object} post data
* @param {array} feed list
* @return {boolean} 🙏
*/

const _here = (post, feed) => {
  for (const items in feed) {
    if (feed[items]._id === post._id) {
      return true;
    }
  }
  return false;
};

/**
* @summary remove delegations without votes left
* @param {object} feed the query from db

NOTE: remove this
const _sanitize = (feed) => {
  return _.filter(feed, (value) => { return ((value.kind === 'DELEGATION' && value.wallet.available > 0) || (value.kind !== 'DELEGATION')); });
};
*/

Template.feed.onCreated(function () {
  Template.instance().count = new ReactiveVar(0);
  Template.instance().feed = new ReactiveVar();
  Template.currentData().refresh = false;
  Template.currentData().singlePost = false;

  const instance = this;

  console.log('STARTING ANEW');

  instance.subscribe('feed', Template.currentData().options);
  const parameters = query(Template.currentData().options);

  // verify if beginning
  const beginning = ((Template.currentData().options.skip === 0) && !instance.feed.get());
  if (beginning) { $('.right').scrollTop(0); }
  instance.data.refresh = beginning;
  instance.data.singlePost = (instance.data.options.view === 'post');

  const dbQuery = Contracts.find(parameters.find, parameters.options);
  this.handle = dbQuery.observeChanges({
    changed: (id, fields) => {
      // changed stuff
      console.log('changed query');
      console.log(id);
      console.log(fields);
    },
    addedBefore: (id, fields) => {
      // added stuff
      const currentFeed = instance.feed.get();
      const post = fields;
      post._id = id;
      if (!currentFeed) {
        instance.feed.set([post]);
        instance.data.refresh = false;
      } else if (!_here(post, currentFeed)) {
        currentFeed.push(post);
        instance.feed.set(_.uniq(currentFeed));
      }
    },
  });
});

Template.feed.onRendered(function () {
  const instance = this;
  instance.autorun(function () {
    const count = instance.subscribe('feedCount', Template.currentData().options);

    // total items on the feed
    if (count.ready()) {
      instance.count.set(Counts.get('feedItems'));
    }

    if (Meteor.user()) {
      const draft = instance.subscribe('contractDrafts', { view: 'contractByKeyword', keyword: `draft-${Meteor.userId()}` });
      if (draft.ready()) {
        const draftContract = Contracts.findOne({ keyword: `draft-${Meteor.userId()}` });
        if (draftContract) {
          Session.set('draftContract', draftContract);
        } else {
          Session.set('draftContract', createContract());
        }
      }
    }
  });
});

Template.feed.onDestroyed(function () {
  console.log(`killing ${this.handle}`);
  console.log(this.handle);
  this.handle.stop();
  delete this.handle;
});

Template.feed.helpers({
  item() {
    return Template.instance().feed.get();
  },
  refresh() {
    return Template.currentData().refresh;
  },
  beginning() {
    return (Template.currentData().options.skip === 0);
  },
  single() {
    return Template.currentData().singlePost;
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

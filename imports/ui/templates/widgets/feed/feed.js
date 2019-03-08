import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { query } from '/lib/views';
import { here } from '/lib/utils';
import { gui } from '/lib/const';
import { Contracts } from '/imports/api/contracts/Contracts';
import { toggleSidebar } from '/imports/ui/modules/menu';

import '/imports/ui/templates/widgets/feed/feed.html';
import '/imports/ui/templates/widgets/feed/feedItem.js';
import '/imports/ui/templates/widgets/feed/feedEmpty.js';
import '/imports/ui/templates/widgets/feed/feedLoad.js';

/**
* @summary query to detect each parent
* @param {string} replyId replying to item id
* @param {array} list the feed
*/
const _parentDepth = (replyId, list) => {
  const feed = list;
  for (let i = 0; i < feed.length; i += 1) {
    if (feed[i]._id === replyId) {
      if (feed[i].depth) {
        return feed[i].depth;
      }
      return _setDepth(feed[i].replyId, feed, i);
    }
  }
  return undefined;
};

/**
* @summary assigns depth degree
* @param {string} replyId replying to item id
* @param {array} list the feed
* @param {number} index current item being evaluated
*/
const _setDepth = (replyId, list, index) => {
  const feed = list;
  if (!replyId) {
    return 0;
  } else if (replyId === feed[0]._id) {
    return 1;
  }
  return _parentDepth(feed[index].replyId, feed) + 1;
};

/**
* @summary rearranges feed array based on depth of comment in thread
* @param {array} list the feed
* @return {array} changed feed
*/
const _feedDepth = (list) => {
  let feed = list;
  for (let i = 0; i < feed.length; i += 1) {
    feed[i].depth = _setDepth(feed[i].replyId, feed, i);
  }
  feed = _.sortBy(feed, 'depth');
  const newFeed = feed;
  let children = [];
  for (let j = 0; j < feed.length; j += 1) {
    children = [];
    if ((feed[j].totalReplies > 0) && feed[j].depth > 0) {
      for (let k = 0; k < feed.length; k += 1) {
        if (feed[j]._id === feed[k].replyId) {
          children.push(feed[k]);
        }
      }
    }
    if (children.length > 0) {
      for (let m = 0; m < newFeed.length; m += 1) {
        for (let l = 0; l < children.length; l += 1) {
          if (newFeed[m]._id === children[l]._id) {
            newFeed.splice(m, 1);
          }
        }
      }
      newFeed.splice(parseInt(j + 1, 10), 0, ...children);
    }
  }
  return newFeed;
};

/**
* @summary if its an ovewview feed (not post thread)
* @return {boolean} feed is an overview not a thread
*/
const _isIndexFeed = (instance) => {
  return (instance.options.view === 'lastVotes'
    || instance.options.view === 'latest'
    || instance.options.view === 'linkedFeed'
    || instance.options.view === 'geo'
    || instance.options.view === 'token'
    || instance.options.view === 'transactionsToken'
    || instance.options.view === 'transactionsPeer'
    || instance.options.view === 'transactionsGeo'
    || instance.options.view === 'peer'
    || instance.mainPost === true);
};

const _getFeedView = (view) => {
  switch (view) {
    case 'transactionsToken':
      return 'token';
    case 'transactionsPeer':
      return 'peer';
    case 'transactionsGeo':
      return 'geo';
    case 'lastVotes':
      return 'latest';
    default:
      return view;
  }
};


Template.feed.onCreated(function () {
  Template.instance().count = new ReactiveVar(Template.currentData().count);
  Template.instance().feed = new ReactiveVar();
  Template.currentData().refresh = false;
  Template.instance().counted = new ReactiveVar(false);
  Template.instance().rendered = false;
  Template.instance().lastItemDate = new ReactiveVar();

  const instance = this;

  if ((Meteor.Device.isPhone() && Session.get('sidebar')) || (Session.get('miniWindow') && Session.get('sidebar'))) {
    toggleSidebar(false);
  }

  if (Meteor.Device.isPhone() && Meteor.user()) {
    // document.getElementsByClassName('split-left')[0].style.paddingTop = '60px';
  }

  // tailor feed to show a specific kind of post
  if (Template.currentData().kind) {
    Template.currentData().options.kind = Template.currentData().kind;
  }

  const options = Template.currentData().options;

  if (Template.currentData().linkedFeed) {
    options.lastItem = Template.currentData().lastItem;
    if (options.view !== 'linkedFeed') {
      options.subview = options.view;
    }
    options.view = 'linkedFeed';
  }
  this.subscription = instance.subscribe('feed', options);
  const parameters = query(options);

  // verify if beginning
  const beginning = ((options.skip === 0) && !instance.feed.get());
  if (beginning) { $('.right').scrollTop(0); }
  instance.data.refresh = beginning;

  const dbQuery = Contracts.find(parameters.find, parameters.options);

  this.handle = dbQuery.observeChanges({
    addedBefore: (id, fields, before) => {
      // added stuff
      const currentFeed = instance.feed.get();
      const post = fields;

      let newItem = false;
      if (before) {
        if (instance.data.options.skip > 0) {
          instance.data.options.skip -= gui.ITEMS_PER_PAGE;
        }
        for (let i = 0; i < currentFeed.length; i += 1) {
          if (currentFeed[i]._id === before) {
            newItem = true;
            break;
          }
        }
        let count = instance.count.get();
        instance.count.set(count += 1);
      }
      if (!before || (newItem && !instance.data.linkedFeed)) {
        post._id = id;
        if (instance.data.displayActions) {
          post.displayActions = true;
        }
        if (!(instance.data.noReplies && post.replyId)) {
          if (!currentFeed) {
            instance.feed.set([post]);
            instance.data.refresh = false;
          } else if (!here(post, currentFeed)) {
            currentFeed.push(post);
            instance.feed.set(_.uniq(currentFeed));
          }
        }
      }
    },
    changed: (id, fields) => {
      const feed = instance.feed.get();

      for (let i = 0; i < feed.length; i += 1) {
        if (feed[i]._id === id) {
          feed[i] = Object.assign(feed[i], fields);
          break;
        }
      }

      instance.feed.set(feed);
    },
  });
});

Template.feed.onRendered(function () {
  const instance = this;
  instance.autorun(function () {
    if (!instance.counted.get()) {
      const options = Template.currentData().options;

      if (options.view === 'linkedFeed') {
        instance.counted.set(true);
      } else {
        options.view = _getFeedView(options.view);
        const count = instance.subscribe('feedCount', options);

        // total items on the feed
        if (count.ready()) {
          instance.count.set(Counts.get('feedItems'));
          instance.counted.set(true);
        }
      }
    }
  });
});

Template.feed.onDestroyed(function () {
  this.handle.stop();
  this.subscription.stop();
});

Template.feed.helpers({
  item() {
    let feed = Template.instance().feed.get();

    // main view
    if (feed) {
      if (_isIndexFeed(this)) {
        // general view
        for (let i = 0; i <= (feed.length - 1); i += 1) {
          feed[i].mainFeed = true;
        }

        // sorting
        if (this.options.sort) {
          feed = _.sortBy(feed, function (item) { return item.createdAt * -1; });
        }
      } else {
        // thread view
        feed = _.sortBy(feed, 'createdAt');
        feed = _feedDepth(feed);
        for (let i = 0; i <= (feed.length - 1); i += 1) {
          feed[i].mainFeed = false;
          if (i === (feed.length - 1)) {
            feed[i].lastItem = true;
          } else {
            feed[i].lastItem = false;
          }
          if (i !== 0) {
            feed[i].previousItem = feed[i - 1]._id;
          }
        }
      }
      if (feed.length > this.options.limit) {
        feed.splice(-1, parseInt(feed.length - this.options.limit, 10));
      }
      Template.instance().lastItemDate.set(feed[feed.length - 1].createdAt);
    }
    return feed;
  },
  lastItem() {
    return Template.instance().lastItemDate.get();
  },
  empty() {
    if (Session.get('showPostEditor')) {
      return false;
    }
    if (Template.instance().feed.get()) {
      return (Template.instance().feed.get().length === 0);
    }
    return (!Template.instance().feed.get());
  },
  refresh() {
    return Template.currentData().refresh;
  },
  identifier() {
    let id = 0;
    if (Template.instance().counted.get()) {
      const pages = $('.page');
      id = parseInt(((this.options.limit + this.options.skip) / gui.ITEMS_PER_PAGE) + 1, 10);
      if (pages.length > 0) {
        const lastID = pages[pages.length - 1].id.replace('page-', '').toNumber();
        id = parseInt(lastID + 1, 10);
      }
      return id;
    }
    return 0;
  },
  beginning() {
    return (Template.currentData().options.skip === 0 || Template.currentData().singlePost);
  },
  single() {
    return (Template.currentData().singlePost || !Meteor.user());
  },
  emptyContent() {
    return Session.get('emptyContent');
  },
  count() {
    return Template.instance().count.get();
  },
  placeholderItem() {
    return [1, 2, 3];
  },
});

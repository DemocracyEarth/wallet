import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { query } from '/lib/views';
import { here } from '/lib/utils';
import { Contracts } from '/imports/api/contracts/Contracts';
import { createContract } from '/imports/startup/both/modules/Contract';
import { toggleSidebar } from '/imports/ui/modules/menu';

import '/imports/ui/templates/widgets/feed/feed.html';
import '/imports/ui/templates/widgets/feed/feedItem.js';
import '/imports/ui/templates/widgets/feed/feedEmpty.js';
import '/imports/ui/templates/widgets/feed/feedLoad.js';

Template.feed.onCreated(function () {
  Template.instance().count = new ReactiveVar(0);
  Template.instance().feed = new ReactiveVar();
  Template.currentData().refresh = false;

  const instance = this;

  if ((Meteor.Device.isPhone() && Session.get('sidebar')) || (Session.get('miniWindow') && Session.get('sidebar'))) {
    toggleSidebar(false);
  }

  // tailor feed to show a specific kind of post
  if (Template.currentData().kind) {
    Template.currentData().options.kind = Template.currentData().kind;
  }

  this.subscription = instance.subscribe('feed', Template.currentData().options);
  const parameters = query(Template.currentData().options);

  // verify if beginning
  const beginning = ((Template.currentData().options.skip === 0) && !instance.feed.get());
  if (beginning) { $('.right').scrollTop(0); }
  instance.data.refresh = beginning;

  const dbQuery = Contracts.find(parameters.find, parameters.options);
  this.handle = dbQuery.observeChanges({
    changed: () => {
      // TODO: be reactive please
      // displayNotice(TAPi18n.__('notify-new-posts'), true);
    },
    addedBefore: (id, fields) => {
      // added stuff
      const currentFeed = instance.feed.get();
      const post = fields;
      post._id = id;
      if (!currentFeed) {
        instance.feed.set([post]);
        instance.data.refresh = false;
      } else if (!here(post, currentFeed)) {
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
  this.handle.stop();
  this.subscription.stop();
});

Template.feed.helpers({
  item() {
    return Template.instance().feed.get();
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

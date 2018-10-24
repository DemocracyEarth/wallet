import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Counts } from 'meteor/tmeasday:publish-counts';

import { gui } from '/lib/const';

import '/imports/ui/templates/widgets/feed/paginator.html';
import '/imports/ui/templates/widgets/feed/feedLoad.js';


/**
* @summary if the end of the currently loaded feed was reached
* @param {string} id div element signalling end of feed
*/
const _aboveFold = (id) => {
  if ($(`#page-${id}`)[0]) {
    const rect = $(`#page-${id}`)[0].getBoundingClientRect();
    return (rect.top > 60 && rect.bottom <= parseInt($(window).height() + 300, 10));
  }
  return false;
};

Template.paginator.onCreated(function () {
  console.log('A paginator has been created');
  Template.instance().identifier = parseInt(((this.data.options.limit + this.data.options.skip) / gui.ITEMS_PER_PAGE) + 1, 10);
  Template.instance().loaded = new ReactiveVar(false);
  Template.instance().count = new ReactiveVar(this.count);
  Template.instance().configured = new ReactiveVar(false);
});

Template.paginator.onRendered(function () {
  const identifier = Template.instance().identifier;
  const loaded = Template.instance().loaded;
  let isScrolling;

  if (Meteor.Device.isPhone() || window.innerWidth <= 991) {
    Session.set('scrollerDiv', '.right');
  } else {
    Session.set('scrollerDiv', '.split-left');
  }

  const instance = this;

  instance.autorun(function () {
    $(Session.get('scrollerDiv')).scroll(() => {
      Meteor.clearTimeout(isScrolling);
      isScrolling = Meteor.setTimeout(function () {
        console.log('scrolling...');
        console.log(loaded.get());
        if (!loaded.get()) {
          if (_aboveFold(identifier)) {
            loaded.set(true);
          }
        }
      }, 100);
    });
  });
});

Template.paginator.helpers({
  end() {
    console.log(`end why? skip: ${this.options.skip} + limit: ${this.options.limit} < count: ${this.count}`);
    return !((this.options.skip + this.options.limit) < this.count);
  },
  empty() {
    return (this.count === 0);
  },
  subfeed() {
    return this.subfeed;
  },
  identifier() {
    return Template.instance().identifier;
  },
  visible() {
    console.log(`loaded: ${Template.instance().loaded.get()}`);
    console.log(`configured: ${Template.instance().configured.get()}`);
    return Template.instance().loaded.get();
  },
  nextOptions() {
    if (!Template.instance().configured.get()) {
      let nextSkip = (this.options.skip + gui.ITEMS_PER_PAGE);
      if (nextSkip > this.count) { nextSkip = this.count; }
      this.options.skip = nextSkip;
      console.log(`IS BUILDING A NEEEEEEEEEEXT OPTION ${this.options.skip}`);
      Template.instance().configured.set(true);
    }
    this.options.view = Session.get('longFeedView');
    return this.options;
  },
  count() {
    return this.count;
  },
});

Template.paginator.events({
  'click #feed-bottom'() {
    $('.right').animate({ scrollTop: 0 });
  },
});

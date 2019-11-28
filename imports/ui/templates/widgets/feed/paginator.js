import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

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
  Template.instance().identifier = new ReactiveVar(Template.currentData().identifier);
  Template.instance().loaded = new ReactiveVar(false);
  Template.instance().count = new ReactiveVar(this.count);
  Template.instance().configured = new ReactiveVar(false);
});

Template.paginator.onRendered(function () {
  const identifier = Template.instance().identifier.get();
  const loaded = Template.instance().loaded;
  let isScrolling;

  /*
  if (Meteor.Device.isPhone() || window.innerWidth <= 991) {
    Session.set('scrollerDiv', '.right');
  } else {
    Session.set('scrollerDiv', '.right');
  }
  */

  const instance = this;

  instance.autorun(function () {
    $('.right').scroll(() => {
      Meteor.clearTimeout(isScrolling);
      isScrolling = Meteor.setTimeout(function () {
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
    return !((this.options.skip + this.options.limit) < this.count);
  },
  empty() {
    return (this.count === 0);
  },
  subfeed() {
    return this.subfeed;
  },
  identifier() {
    return Template.instance().identifier.get();
  },
  visible() {
    return Template.instance().loaded.get();
  },
  nextOptions() {
    if (!Template.instance().configured.get()) {
      let nextSkip = (this.options.skip + gui.ITEMS_PER_PAGE);
      if (nextSkip > this.count) { nextSkip = this.count; }
      this.options.skip = nextSkip;
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
    $(Session.get('scrollerDiv')).animate({ scrollTop: 0 });
  },
});

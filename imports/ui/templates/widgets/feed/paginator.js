import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import { gui } from '/lib/const';

import './paginator.html';

/**
* @summary if the end of the currently loaded feed was reached
* @param {string} id div element signalling end of feed
*/
const _aboveFold = (id) => {
  if ($(`#page-${id}`)[0]) {
    const rect = $(`#page-${id}`)[0].getBoundingClientRect();
    return (rect.top > -1 && rect.bottom <= parseInt($(window).height() + 300, 10));
  }
  return false;
};

Template.paginator.onCreated(function () {
  Template.instance().identifier = parseInt(((this.data.limit + this.data.skip) / gui.ITEMS_PER_PAGE) + 1, 10);
  Template.instance().loaded = new ReactiveVar(false);
});

Template.paginator.onRendered(function () {
  const opts = {
    lines: 17,
    length: 13,
    width: 3,
    radius: 32,
    scale: 0.4,
    corners: 1,
    color: '#000',
    opacity: 0.3,
    rotate: 0,
    direction: 1,
    speed: 1,
    trail: 60,
    fps: 20,
    zIndex: 2e9,
    className: 'spinner',
    top: '40px',
    left: 'auto',
    shadow: false,
    hwaccel: false,
    position: 'relative',
  };

  const identifier = Template.instance().identifier;
  const loaded = Template.instance().loaded;

  $('.right').scroll(() => {
    if (!loaded.get()) {
      if (_aboveFold(identifier)) {
        loaded.set(true);
      }
    }
  });

  const target = document.getElementById('spinner-feed');
  if (typeof Spinner !== 'undefined') {
    let spinner = new Spinner(opts).spin(target);
  }
});

Template.paginator.helpers({
  end() {
    return !((this.skip + this.limit) < this.count);
  },
  empty() {
    return (this.count === 0);
  },
  identifier() {
    return Template.instance().identifier;
  },
  visible() {
    return Template.instance().loaded.get();
  },
  nextSkip() {
    let nextSkip = (this.skip + gui.ITEMS_PER_PAGE);
    if (nextSkip > this.count) { nextSkip = this.count; }
    return nextSkip;
  },
});

Template.paginator.events({
  'click #feed-bottom'() {
    $('.right').animate({ scrollTop: 0 });
  },
});

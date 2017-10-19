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
  if ($(`#page-${id}`)) {
    const rect = $(`#page-${id}`)[0].getBoundingClientRect();
    // console.log(`${id} and ${rect.top} = ${(rect.top > -1 && rect.bottom <= parseInt($(window).height() + 200, 10))}`);
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
    lines: 17, // The number of lines to draw
    length: 13, // The length of each line
    width: 3, // The line thickness
    radius: 32, // The radius of the inner circle
    scale: 0.4, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#000', // #rgb or #rrggbb or array of colors
    opacity: 0.3, // Opacity of the lines
    rotate: 0, // The rotation offset
    direction: 1, // 1: clockwise, -1: counterclockwise
    speed: 1, // Rounds per second
    trail: 60, // Afterglow percentage
    fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '40px', // Top position relative to parent
    left: 'auto', // Left position relative to parent
    shadow: false, // Whether to render a shadow
    hwaccel: false, // Whether to use hardware acceleration
    position: 'relative', // Element positioning
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

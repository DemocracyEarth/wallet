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
    return (rect.top > -1 && rect.bottom <= $(window).height());
  }
  return false;
};

Template.paginator.onCreated(function () {
  Template.instance().identifier = ((this.data.limit / gui.ITEMS_PER_PAGE) + 1);
  Template.instance().loaded = new ReactiveVar(false);
});

Template.paginator.onRendered(function () {
  const identifier = Template.instance().identifier;
  const loaded = Template.instance().loaded;

  $('.right').scroll(() => {
    if (_aboveFold(identifier)) {
      loaded.set(true);
    }
  });
});

Template.paginator.helpers({
  end() {
    return !(this.limit < this.count);
  },
  identifier() {
    return Template.instance().identifier;
  },
  visible() {
    return Template.instance().loaded.get();
  },
});

Template.paginator.events({
  'click #feed-bottom'() {
    $('.right').animate({ scrollTop: 0 });
  },
});

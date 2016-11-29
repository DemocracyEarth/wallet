import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import './agora.html';
import './postComment.js';
import './thread/thread.js';
import '../../identity/login/socialMediaLogin.js';

function resizeSplit(diff) {
  if ($('.split-right') && $('.split-left')) {
    const contentWidth = $('.right').width();
    const half = parseInt(contentWidth / 2, 10);
    $('.split-left').width(`${parseInt(half + diff, 10)}px`);
    $('.split-right').width(`${parseInt(half - diff, 10)}px`);
  }
}

Template.agora.onCreated(function () {
  Session.set('resizeSplit', false);
  Session.set('resizeSplitCursor', { x: 0, y: 0 });

  // windowLoop();
  $(window).mousemove((event) => {
    if (Session.get('resizeSplit')) {
      event.preventDefault();
      const left = parseInt($('.split-right').css('left'), 10);
      const delta = {
        x: parseInt(event.pageX - Session.get('resizeSplitCursor').x, 10),
        y: parseInt(event.pageY - Session.get('resizeSplitCursor').y, 10),
      };
      resizeSplit(delta.x);
      $('.split-right').css('marginLeft', delta.x);
      console.log(left);
    }
  });
  $(window).mouseup(() => {
    Session.set('resizeSplit', false);
  });
});

Template.agora.helpers({
  emptyThread() {
    if (Session.get('contract')) {
      if (Session.get('contract').events !== undefined) {
        if (Session.get('contract').events.length > 0) {
          return false;
        }
        return true;
      }
      return true;
    }
    return undefined;
  },
  event() {
    if (Session.get('contract')) {
      return Session.get('contract').events;
    }
    return undefined;
  },
});

Template.agora.events({
  'mousedown #resizable'(event) {
    event.preventDefault();
    Session.set('resizeSplit', true);
    Session.set('resizeSplitCursor', { x: event.pageX, y: event.pageY });
  },
});

import { $ } from 'meteor/jquery';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { windowLoop } from '/imports/ui/modules/popup';

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
  this.resizingSplit = new ReactiveVar(false);
  this.cursorPosition = new ReactiveVar({ x: 0, y: 0 });
  windowLoop();
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
  'mousedown #resizable'(event, instance) {
    event.preventDefault();
    instance.resizingSplit.set(true);
    instance.cursorPosition.set({ x: event.pageX, y: event.pageY });
    console.log(instance.cursorPosition.get());
  },
  'mouseup'(event, instance) {
    instance.resizingSplit.set(false);
  },
  'mousemove'(event, instance) {
    if (instance.resizingSplit.get()) {
      event.preventDefault();
      const left = parseInt($('.split-right').css('left'), 10);
      const delta = {
        x: parseInt(event.pageX - instance.cursorPosition.get().x, 10),
        y: parseInt(event.pageY - instance.cursorPosition.get().y, 10),
      };
      resizeSplit(delta.x);
      console.log(left);
    }
  },
});

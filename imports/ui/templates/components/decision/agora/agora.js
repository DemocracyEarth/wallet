import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { setupSplit } from '/imports/ui/modules/split';

import './agora.html';
import './postComment.js';
import './thread/thread.js';
import '../../identity/login/socialMediaLogin.js';

Template.agora.onCreated(function () {
  setupSplit();
});

Template.agora.helpers({
  emptyThread() {
    if (Session.get('contract')) {
      if (Session.get('contract').events !== undefined && Session.get('contract').events.length > 0) {
        return false;
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
    Session.set('resizeSplitCursor', {
      x: parseInt(event.pageX - parseInt($('.split-right').css('marginLeft'), 10), 10),
      y: event.pageY,
      windowWidth: window.innerWidth,
    });
  },
});

import { $ } from 'meteor/jquery';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { setupSplit } from '/imports/ui/modules/split';

import '/imports/ui/templates/components/decision/ledger/ledger.html';

Template.ledger.onCreated(function () {
  setupSplit();
});

Template.ledger.helpers({
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

Template.ledger.events({
  'mousedown #resizable'(event) {
    event.preventDefault();
    Session.set('resizeSplit', true);
    Session.set('resizeSplitCursor', {
      x: parseInt(event.pageX - parseInt($('.split-right').css('marginLeft'), 10), 10),
      y: event.pageY,
    });
  },
});

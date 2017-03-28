import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { Meteor } from 'meteor/meteor';

import { displayPopup, animatePopup } from '/imports/ui/modules/popup';

import './authentication.html';
import '../../components/identity/avatar/avatar.js';

Template.authentication.rendered = function rendered() {
  Session.set('logger', false);
};

Template.authentication.helpers({
  toggle() {
    if (Session.get('logger')) {
      return 'navbar-button-active';
    }
    return '';
  },
});

Template.authentication.events({
  'click #loggedUser'(event) {
    const logger = `login-${Meteor.userId()}`;
    if (!Session.get(logger) || !Session.get(logger).visible) {
      displayPopup(event.target, 'login', Meteor.userId(), event.type, logger);
    } else {
      animatePopup(false, logger);
    }
  },
});

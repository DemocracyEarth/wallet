import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';

import { displayPopup, animatePopup } from '/imports/ui/modules/popup';

import './authentication.html';
import '../../components/identity/avatar/avatar.js';

Template.authentication.onRendered(() => {
  Session.set('logger', false);
});

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
      Session.set('logger', true);
      displayPopup($('#loggedUser')[0], 'login', Meteor.userId(), event.type, logger);
    } else {
      Session.set('logger', false);
      animatePopup(false, logger);
    }
  },
});

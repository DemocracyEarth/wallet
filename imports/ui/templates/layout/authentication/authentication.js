import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';

import { publishContract } from '/imports/startup/both/modules/Contract';
import { displayNotice } from '/imports/ui/modules/notice';
import { displayPopup, animatePopup } from '/imports/ui/modules/popup';

import './authentication.html';
import '../../components/identity/avatar/avatar.js';

function isDisabled() {
  return (Session.get('missingTitle') || Session.get('mistypedTitle') || Session.get('duplicateURL') || (Session.get('availableChars') < 0));
}

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
  postButton() {
    return Session.get('newPostEditor');
  },
  postDisabled() {
    if (isDisabled()) {
      return 'navbar-button-action-disabled';
    }
    return '';
  },
});

Template.authentication.events({
  'click #loggedUser'(event) {
    event.stopPropagation();
    const logger = `login-${Meteor.userId()}`;
    if (!Session.get(logger) || !Session.get(logger).visible) {
      Session.set('logger', true);
      displayPopup($('#loggedUser')[0], 'login', Meteor.userId(), event.type, logger);
    } else {
      Session.set('logger', false);
      animatePopup(false, logger);
    }
  },
  'click #navbar-post-button'() {
    if (!isDisabled()) {
      publishContract(Session.get('contract')._id);
      displayNotice(TAPi18n.__('posted-idea'), true);
      Session.set('newPostEditor', false);
      window.history.back();
    }
  },
});

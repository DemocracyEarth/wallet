import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';

import { editorFadeOut } from '/imports/ui/templates/components/decision/editor/editor';
import { publishContract } from '/imports/startup/both/modules/Contract';
import { displayNotice } from '/imports/ui/modules/notice';
import { displayPopup, animatePopup, clearPopups } from '/imports/ui/modules/popup';

import './authentication.html';
import '../../components/identity/avatar/avatar.js';

function isDisabled() {
  return (Session.get('missingTitle') || Session.get('mistypedTitle') || Session.get('duplicateURL') || (Session.get('availableChars') < 0));
}

Template.authentication.onRendered(() => {
  Session.set('userLoginVisible', false);
});

Template.authentication.helpers({
  toggle() {
    if (Session.get('userLoginVisible')) {
      return 'navbar-button-active';
    }
    return '';
  },
  postButton() {
    if (this.desktop) {
      return (!Meteor.Device.isPhone());
    }
    return Session.get('showPostEditor');
  },
  postDisabled() {
    if (isDisabled()) {
      return 'navbar-button-action-disabled';
    }
    return '';
  },
  context() {
    return ((Meteor.Device.isPhone() && !this.desktop) || (!Meteor.Device.isPhone() && this.desktop));
  },
});

Template.authentication.events({
  'click #loggedUser'(event) {
    event.stopPropagation();

    const userLogin = "user-login"

    if (!Session.get(userLogin) || !Session.get(userLogin).visible) {
      Session.set('userLoginVisible', true);
      displayPopup($('#loggedUser')[0], 'login', Meteor.userId(), event.type, userLogin);
    } else {
      Session.set('userLoginVisible', false);
      animatePopup(false, userLogin);
    }
  },
  'click #navbar-post-button'() {
    if (!isDisabled()) {
      publishContract(Session.get('draftContract')._id);
      editorFadeOut(Session.get('draftContract')._id);
      displayNotice(TAPi18n.__('posted-idea'), true);
    }
  },
});

import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';

import { editorFadeOut } from '/imports/ui/templates/components/decision/editor/editor';
import { publishContract, createContract } from '/imports/startup/both/modules/Contract';
import { displayNotice } from '/imports/ui/modules/notice';
import { displayPopup, animatePopup } from '/imports/ui/modules/popup';

import '/imports/ui/templates/layout/authentication/authentication.html';
import '/imports/ui/templates/components/identity/avatar/avatar.js';

function _isDisabled() {
  return (Session.get('missingTitle') || Session.get('mistypedTitle') || Session.get('duplicateURL') || (Session.get('availableChars') < 0));
}

function promptLogin(logged, event) {
  if (logged) {
    Session.set('userLoginVisible', true);
    displayPopup($('#loggedUser')[0], 'login', Meteor.userId(), event.type, 'user-login');
  } else {
    Session.set('userLoginVisible', false);
    animatePopup(false, 'user-login');
  }
}

Template.authentication.onRendered(() => {
  Session.set('userLoginVisible', false);
  if (!Session.get('checkInitialSetup') && Meteor.userId() === null) {
    promptLogin(true, 'click');
    Session.set('checkInitialSetup', true);
  }
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
    if (_isDisabled()) {
      return 'navbar-button-action-disabled';
    }
    return '';
  },
  iconDisabled() {
    if (_isDisabled()) {
      return 'decision-proposals-disabled.png';
    }
    return 'decision-proposals-active.png';
  },
  context() {
    return ((Meteor.Device.isPhone() && !this.desktop) || (!Meteor.Device.isPhone() && this.desktop));
  },
});

Template.authentication.events({
  'click #loggedUser'(event) {
    event.stopPropagation();
    promptLogin((!Session.get('user-login') || !Session.get('user-login').visible), event);
  },
  'click #navbar-post-button'() {
    if (!_isDisabled()) {
      const publish = Session.get('draftContract');
      publishContract(publish._id);
      displayNotice(TAPi18n.__('posted-idea'), true);
      document.getElementById('titleContent').innerText = '';
      Session.set('missingTitle', false);

      const draft = createContract();
      Session.set('draftContract', draft);


      if (!draft.replyId) {
        Session.set('minimizedEditor', true);
      }
      $('#titleContent').focus();
    }
  },
});

export const isDisabled = _isDisabled;

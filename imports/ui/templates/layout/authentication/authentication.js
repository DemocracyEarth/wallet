import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { ReactiveVar } from 'meteor/reactive-var';
import { TAPi18n } from 'meteor/tap:i18n';
import { displayModal } from '/imports/ui/modules/modal';

import { publishContract, createContract, contractURI, entangle, getURLDate } from '/imports/startup/both/modules/Contract';
import { editorFadeOut } from '/imports/ui/templates/components/decision/editor/editor';
import { displayPopup, animatePopup } from '/imports/ui/modules/popup';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';

import '/imports/ui/templates/layout/authentication/authentication.html';
import '/imports/ui/templates/components/identity/avatar/avatar.js';


const modal = {
  icon: Meteor.settings.public.app.logo,
  title: TAPi18n.__('wallet'),
  cancel: TAPi18n.__('close'),
  alertMode: true,
};

function _isDisabled() {
  if (Meteor.user().profile.wallet.reserves) {
    return (entangle(Session.get('draftContract')) === undefined) ||
    Session.get('missingTitle') ||
    Session.get('mistypedTitle') ||
    Session.get('duplicateURL') ||
    Session.get('availableChars') < 0;
  }
  return (Session.get('missingTitle') || Session.get('mistypedTitle') || Session.get('duplicateURL') || (Session.get('availableChars') < 0));
}

/**
* @summary publish a new contract
*/
const _publish = () => {
  if (!_isDisabled()) {
    // publish
    const draft = Session.get('draftContract');
    const uri = contractURI(document.getElementById('titleContent').innerText, draft._id);
    const url = `${getURLDate(draft)}${uri}`;
    publishContract(draft._id, uri);

    // announce
    document.getElementById('titleContent').innerText = '';
    Session.set('missingTitle', false);

    // reset
    const newDraft = createContract();
    Session.set('draftContract', newDraft);

    if (/\d/.test(window.location.pathname.substring(1, 4)) || window.location.pathname.substring(1, 4) === '@') {
      // new
      Router.go(url);
    } else {
      // clean
      $('#thread-editor-depth').remove();
      if (!newDraft.replyId) {
        Session.set('minimizedEditor', true);
      }
      $('#titleContent').focus();
    }
  }
};

function promptLogin(logged, event) {
  if (logged) {
    Session.set('userLoginVisible', true);
    displayPopup($('#loggedUser')[0], 'login', Meteor.userId(), event.type, 'user-login');
  } else {
    Session.set('userLoginVisible', false);
    animatePopup(false, 'user-login');
  }
}

Template.authentication.onCreated(function () {
  Template.instance().imageTemplate = new ReactiveVar();
  const instance = Template.instance();
  templetize(instance);
});

Template.authentication.onRendered(() => {
  Session.set('userLoginVisible', false);
  if (!Session.get('checkInitialSetup') && Meteor.userId() === null) {
    // promptLogin(true, 'click');
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
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
});

Template.authentication.events({
  'click #loggedUser'(event) {
    event.stopPropagation();
    if (Meteor.user()) {
      Router.go(`/address/${Meteor.user().username}`);      
    } else {
      Session.set('userLoginVisible', true);
      Meteor.loginWithMetamask({}, function (err) {
        if (err.reason) {
          throw new Meteor.Error('Metamask login failed', err.reason);
        }
        Session.set('userLoginVisible', false);
      });
    }
  },
  'click #mobile-logout'() {
    displayModal(
      true,
      {
        icon: Meteor.settings.public.app.logo,
        title: TAPi18n.__('sign-out'),
        message: TAPi18n.__('sign-out-prompt'),
        cancel: TAPi18n.__('close'),
        action: TAPi18n.__('sign-out'),
        alertMode: false,
      },
      () => {
        Meteor.logout();
      }
    );
  },
  'click #navbar-post-button'() {
    _publish();
    if (Meteor.Device.isPhone()) {
      editorFadeOut(Session.get('draftContract')._id);
      Session.set('showPostEditor', false);
    }
  },
});

export const isDisabled = _isDisabled;

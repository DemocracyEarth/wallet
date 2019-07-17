import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { displayPopup, animatePopup } from '/imports/ui/modules/popup';
import { resetSplit } from '/imports/ui/modules/split';
import { showSidebar } from '/imports/ui/templates/layout/sidebar/sidebar';

import '/imports/ui/templates/components/collective/collective.html';

const _promptLogin = (logged, event) => {
  if (logged) {
    Session.set('userLoginVisible', true);
    displayPopup($('#collective-login')[0], 'login', Meteor.userId(), event.type, 'user-login');
  } else {
    Session.set('userLoginVisible', false);
    animatePopup(false, 'user-login');
  }
};

Template.collective.onRendered(() => {
  Session.set('userLoginVisible', false);
  if (!Session.get('checkInitialSetup') && Meteor.userId()) {
    // _promptLogin(true, 'click');
    Session.set('checkInitialSetup', true);
  }

  if (!Meteor.Device.isPhone() && Meteor.user()) {
    // brute force proper rendering
    showSidebar();
    resetSplit();
  }

  window.addEventListener('click', function (e) {
    if (document.getElementById('card-user-login') && !document.getElementById('card-user-login').contains(e.target) &&
         e.target.id !== 'signup' &&
         e.target.id !== 'forgot-pw' &&
         e.target.nodeName !== 'IMG') {
      _promptLogin((!Session.get('user-login') || !Session.get('user-login').visible), event);
    }
  });
});

Template.collective.helpers({
  title() {
    return Meteor.settings.public.Collective.name;
  },
  description() {
    return Meteor.settings.public.Collective.profile.bio;
  },
  picture() {
    if (Meteor.settings.public.Collective.profile.logo) {
      return Meteor.settings.public.Collective.profile.logo;
    }
    return 'images/earth.png';
  },
  hasLogo() {
    return (Meteor.settings.public.Collective.profile.logo !== undefined);
  },
  toggle() {
    if (Session.get('userLoginVisible')) {
      return 'collective-selected';
    }
    return '';
  },
});

Template.collective.events({
  'click #collective-login'() {
    event.stopPropagation();
    _promptLogin((!Session.get('user-login') || !Session.get('user-login').visible), event);
  },
});

export const promptLogin = _promptLogin;

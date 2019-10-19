import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';

import { Collectives } from '/imports/api/collectives/Collectives';
import { displayPopup, animatePopup } from '/imports/ui/modules/popup';
import { resetSplit } from '/imports/ui/modules/split';
import { showSidebar } from '/imports/ui/templates/layout/sidebar/sidebar';
import { ReactiveVar } from 'meteor/reactive-var';

import { shortenCryptoName } from '/imports/ui/templates/components/identity/avatar/avatar';

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

Template.collective.onCreated(function () {
  Template.instance().daoList = new ReactiveVar();

  const instance = this;
  const collectives = instance.subscribe('collectives', { view: 'daoList' });

  instance.autorun(function () {
    if (collectives.ready()) {
      Template.instance().daoList.set(Collectives.find().fetch());
    }
  });
});

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
    const list = Template.instance().daoList.get();
    return (list && list.length > 0) ? Template.instance().daoList.get()[0].name : ''; // Meteor.settings.public.Collective.name;
  },
  description() {
    const list = Template.instance().daoList.get();
    return (list && list.length > 0) ? Template.instance().daoList.get()[0].profile.bio : '';
  },
  picture() {
    const list = Template.instance().daoList.get();
    if (list && list.length > 0) {
      if (Template.instance().daoList.get()[0].profile.logo) {
        return Template.instance().daoList.get()[0].profile.logo;
      }
    }
    return 'images/earth.png';
  },
  username() {
    return shortenCryptoName(Meteor.user().username);
  },
  hasLogo() {
    const list = Template.instance().daoList.get();
    return (list && list.length > 0) ? (Template.instance().daoList.get()[0].profile.logo !== undefined) : false;
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

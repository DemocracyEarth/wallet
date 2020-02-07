import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { timers } from '/lib/const';
import { resetSplit } from '/imports/ui/modules/split';
import { shortenCryptoName } from '/imports/ui/templates/components/identity/avatar/avatar';

import { getTemplate } from '/imports/ui/templates/layout/templater';
import { promptLogin } from '/imports/ui/templates/components/collective/collective.js';
import { validateEmail } from '/imports/startup/both/modules/validations.js';

import '/imports/ui/templates/layout/url/topbar/topbar.html';
import '/imports/ui/templates/widgets/warning/warning.js';
import '/imports/ui/templates/widgets/spinner/spinner.js';

const _prompt = (instance) => {
  const buttonMode = !instance.activeSignIn.get();
  instance.activeSignIn.set(buttonMode);
  promptLogin(buttonMode, event);
};

const _showTopMenu = () => {
  const node = $('.hero-navbar');

  node.addClass('hero-navbar-scroller');
  if (node.css('position') !== 'fixed') {
    node.css('position', 'fixed');
    node.css('top', '-100px');
    node.css('opacity', '1');
    node.css('height', '55px');
    node.velocity('stop');
    node.velocity({ top: '0px' }, { duration: parseInt(timers.ANIMATION_DURATION, 10), easing: 'ease-out' });
  }
};

Template.topbar.onCreated(function () {
  Template.instance().activeSignIn = new ReactiveVar(false);
});


Template.topbar.onRendered(function () {
  const instance = Template.instance();

  _showTopMenu();

  if (!Meteor.Device.isPhone() && !Meteor.user()) {
    resetSplit();
  } else if (Meteor.Device.isPhone() && !Meteor.user() && !instance.data.postMode) {
    $('.split-left').css('padding-top', '0px');
  }

  if (Meteor.Device.isPhone()) {
    window.addEventListener('click', function (e) {
      if (document.getElementById('user-login') && document.getElementById('user-login').contains(e.target)) {
        instance.activeSignIn.set(false);
      }
    });
  }
});

Template.topbar.helpers({
  logoExtended() {
    return Meteor.settings.public.app.logo;
  },
  picture() {
    if (Meteor.settings.public.app.logo) {
      return Meteor.settings.public.app.logo;
    }
    return 'images/earth.png';
  },
  loginMode() {
    if (Session.get('userLoginVisible')) {
      return 'hero-menu-link-signin-active';
    }
    Template.instance().activeSignIn.set(false);
    return '';
  },
  homeURL() {
    return Meteor.settings.public.Collective.domain;
  },
  navbarItem() {
    return Meteor.settings.public.app.config.navbar;
  },
  postMode() {
    return Template.instance().postMode;
  },
  cryptoName(address) {
    return shortenCryptoName(address);
  },
});

Template.topbar.events({
  'click #collective-login'() {
    event.stopPropagation();
    if (Meteor.user()) {
      Router.go(`/address/${Meteor.user().username}`);
    } else {
      Router.go('/');
    }
    // _prompt(Template.instance());
  },
  'click #nav-home'(event) {
    event.preventDefault();
    event.stopPropagation();
    Router.go('/');
  },
});

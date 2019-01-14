import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { timers } from '/lib/const';

import { promptLogin } from '/imports/ui/templates/components/collective/collective.js';

import '/imports/ui/templates/layout/url/hero/hero.html';

Template.hero.helpers({
  title() {
    return TAPi18n.__('landing-title');
  },
  about() {
    return TAPi18n.__('landing-tagline');
  },
});


// Scroll behaviour
let lastScrollTop = 0;
let scrollDown = false;

const scrollingMenu = (instance) => {
  $('.right').scroll(() => {
    const node = $('.hero-navbar');
    const st = $('.right').scrollTop();
    if (st > lastScrollTop && st > 400) {
      instance.scrollingNavbar.set(true);
      scrollDown = true;
      node
        .velocity('stop')
        .velocity({ translateY: '0px' }, { duration: parseInt(timers.ANIMATION_DURATION, 10), easing: 'ease-out' })
        .velocity({ translateY: '-100px' }, {
          duration: parseInt(timers.ANIMATION_DURATION, 10),
          easing: 'ease-out',
          complete: () => {
            node.css('position', 'absolute');
            node.css('top', '0px');
          },
        })
        .velocity('stop');
    } else if (scrollDown === true) {
      scrollDown = false;
      node.css('position', 'fixed');
      node
        .velocity('stop')
        .velocity({ translateY: '-100px' }, { duration: parseInt(timers.ANIMATION_DURATION, 10), easing: 'ease-out' })
        .velocity({ translateY: '0px' }, {
          duration: parseInt(timers.ANIMATION_DURATION, 10),
          easing: 'ease-out',
          complete: () => {
          },
        })
        .velocity('stop');
    }
    lastScrollTop = st;
  });
};


Template.navbar.onCreated(function () {
  Template.instance().activeSignIn = new ReactiveVar(false);
  Template.instance().scrollingNavbar = new ReactiveVar(false);
});


Template.navbar.onRendered(function () {
  scrollingMenu(Template.instance());
});

Template.navbar.helpers({
  picture() {
    if (Meteor.settings.public.Collective.profile.logo) {
      return Meteor.settings.public.Collective.profile.logo;
    }
    return 'images/earth.png';
  },
  loginMode() {
    if (Template.instance().activeSignIn.get()) {
      return 'hero-menu-link-signin-active';
    }
    return '';
  },
  scrollMode() {
    if (Template.instance().scrollingNavbar.get()) {
      return 'hero-navbar-scroller';
    }
    return '';
  },
});

Template.navbar.events({
  'click #collective-login'() {
    event.stopPropagation();
    const buttonMode = !Template.instance().activeSignIn.get();
    Template.instance().activeSignIn.set(buttonMode);
    promptLogin(buttonMode, event);
  },
});

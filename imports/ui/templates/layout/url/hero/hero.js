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


const _prompt = (instance) => {
  const buttonMode = !instance.activeSignIn.get();
  instance.activeSignIn.set(buttonMode);
  promptLogin(buttonMode, event);
};

const scrollingMenu = (instance) => {
  $('.right').scroll(() => {
    const node = $('.hero-navbar');
    const st = $('.right').scrollTop();
    const navbar = instance.scrollingNavbar.get();
    if (instance.activeSignIn.get()) {
      _prompt(instance);
    }
    if (st > 400 && !node.is('.velocity-animating')) {
      instance.scrollingNavbar.set(true);
      if (node.css('position') !== 'fixed') {
        node.css('position', 'fixed');
        node.css('top', '-100px');
        node.velocity('stop');
        node.velocity({ top: '0px' }, { duration: parseInt(timers.ANIMATION_DURATION, 10), easing: 'ease-out' });
      }
    } else if (navbar && st < 400 && !node.is('.velocity-animating')) {
      node.velocity('stop');
      node.velocity({ top: '-100px' }, {
        duration: parseInt(timers.ANIMATION_DURATION, 10),
        easing: 'ease-out',
        complete: () => {
          instance.scrollingNavbar.set(false);
          node.css('position', 'absolute');
          node.css('opacity', 0);
          node.css('top', '0px');
          node.velocity({ opacity: 1 }, { duration: parseInt(timers.ANIMATION_DURATION * 2, 10), easing: 'ease-out' });
        },
      });
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
    _prompt(Template.instance());
  },
});

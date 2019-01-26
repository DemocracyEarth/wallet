import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { $ } from 'meteor/jquery';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';

import { timers } from '/lib/const';
import { resetSplit } from '/imports/ui/modules/split';

import { getHeader } from '/imports/ui/templates/layout/templater';
import { promptLogin } from '/imports/ui/templates/components/collective/collective.js';

import '/imports/ui/templates/layout/url/hero/hero.html';
import { Resolver } from 'dns';

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

const heroMode = (instance) => {
  const node = $('.hero-navbar');
  const st = $('.right').scrollTop();
  if (instance.activeSignIn.get()) {
    _prompt(instance);
  }
  let heroHeight;

  if (instance.data.postMode) {
    heroHeight = 0;
    node.removeClass('hero-navbar-scroller');
    $('.hero').css('position', 'fixed');
    $('.hero').css('z-index', '1');
    if (Meteor.Device.isPhone()) {
      $('.split-left').css('paddingTop', '70px');
    }
  } else {
    heroHeight = 400;
    if (st > heroHeight) {
      node.addClass('hero-navbar-scroller');
      if (node.css('position') !== 'fixed') {
        node.css('position', 'fixed');
        node.css('top', '-100px');
        node.css('opacity', '1');
        node.css('height', '65px');
        node.velocity('stop');
        node.velocity({ top: '0px' }, { duration: parseInt(timers.ANIMATION_DURATION, 10), easing: 'ease-out' });
      }
    } else if (st < heroHeight) {
      node.velocity('stop');
      node.velocity({ top: '-100px' }, {
        duration: parseInt(timers.ANIMATION_DURATION, 10),
        easing: 'ease-out',
        complete: () => {
          node.removeClass('hero-navbar-scroller');
          node.css('position', 'absolute');
          node.css('opacity', 0);
          node.css('top', '0px');
          node.velocity({ opacity: 1 }, { duration: parseInt(timers.ANIMATION_DURATION * 2, 10), easing: 'ease-out' });
        },
      });
    }
  }
};

const scrollingMenu = (instance) => {
  $('.right').scroll(() => {
    heroMode(instance);
  });
};

Template.navbar.onCreated(function () {
  Template.instance().activeSignIn = new ReactiveVar(false);
});


Template.navbar.onRendered(function () {
  const instance = Template.instance();

  if (!instance.data.postMode) {
    scrollingMenu(instance);
  } else {
    $('.right').off('scroll');
    heroMode(instance);
  }

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

Template.navbar.helpers({
  picture() {
    if (Meteor.settings.public.Collective.profile.logo) {
      return Meteor.settings.public.Collective.profile.logo;
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
});

Template.navbar.events({
  'click #collective-login'() {
    event.stopPropagation();
    _prompt(Template.instance());
  },
});

const _template = async (instance) => {
  const html = await getHeader().then((resolved) => { instance.headerTemplate.set(resolved); });
  return html;
};

Template.demo.onCreated(function () {
  Template.instance().headerTemplate = new ReactiveVar();
  _template(Template.instance());
});

Template.demo.helpers({
  renderTemplate() {
    return Template.instance().headerTemplate.get();
  },
});

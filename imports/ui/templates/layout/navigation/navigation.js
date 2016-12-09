import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { timers } from '/lib/const';
import { stripHTMLfromText } from '/imports/ui/modules/utils';
import { toggleSidebar } from '/imports/ui/modules/menu';

import { animate } from '/imports/ui/modules/animation';
import './navigation.html';
import '../authentication/authentication.js';
import '../../widgets/notice/notice.js';

// Scroll behaviour
let lastScrollTop = 0;
let scrollDown = false;

if (Meteor.Device.isPhone()) {
  $(window).scroll(function () {
    const node = $('.navbar');
    const st = $(this).scrollTop();
    if (st > lastScrollTop) {
      if (scrollDown === false && st > 150) {
        scrollDown = true;
        animate(node, 'hide-up', { duration: parseInt(timers.ANIMATION_DURATION * 2.5, 10), easing: 'ease-in' });
      }
    } else if (scrollDown === true) {
      scrollDown = false;
      animate(node, 'show-down', { duration: parseInt(timers.ANIMATION_DURATION * 2.5, 10), easing: 'ease-out' });
    }
    lastScrollTop = st;
  });
}

function displayMenuIcon() {
  if (Session.get('sidebar')) {
    return 'images/burger-active.png';
  }
  return 'images/burger.png';
}

Template.navigation.rendered = function rendered() {
};

Template.navigation.helpers({
  screen() {
    if (Session.get('navbar')) {
      document.title = stripHTMLfromText(`${TAPi18n.__('democracy-of')} ${Meteor.settings.public.Collective.name} - ${Session.get('navbar').title}`);
      return Session.get('navbar').title;
    }
    document.title = stripHTMLfromText(TAPi18n.__('democracy-earth'));
    return '';
  },
  icon() {
    if (Session.get('navbar') !== undefined) {
      return displayMenuIcon();
    }
    return 'images/burger.png';
  },
  link() {
    if (Session.get('navbar')) {
      return Session.get('navbar').href;
    }
    return '';
  },
  showNotice() {
    return Session.get('showNotice');
  },
});

Template.navigation.events({
  'click #menu'() {
    if (Session.get('navbar').action === 'SIDEBAR') {
      toggleSidebar();
    }
  },
});

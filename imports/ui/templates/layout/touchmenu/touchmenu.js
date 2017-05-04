import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';

import './touchmenu.html';

let lastScrollTop = 0;
let scrollDown = false;

function fixMenu() {
  $('#content').scroll(() => {
    const st = $('.right').scrollTop();
    if (st > lastScrollTop) {
      if (scrollDown === false && st > 0) {
        scrollDown = true;
        $('.mobile-menu').css('position', 'fixed');
      }
    } else if (scrollDown === true) {
      $('.mobile-menu').css('position', 'absolute');
      scrollDown = false;
    }
    lastScrollTop = st;
  });
}

Template.touchmenu.onRendered(() => {
  fixMenu();
});

Template.touchmenu.helpers({
});

Template.touchmenu.events({
  'click .menu-button'() {
  },
});

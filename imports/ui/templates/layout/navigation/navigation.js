import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';

import { timers } from '/lib/const';
import { stripHTMLfromText } from '/imports/ui/modules/utils';
import { toggleSidebar } from '/imports/ui/modules/menu';

import './navigation.html';
import '../authentication/authentication.js';
import '../../widgets/notice/notice.js';

//Scroll behaviour
var lastScrollTop = 0;
var scrollDown = false;

if (Meteor.Device.isPhone()) {
  $(window).scroll(function(event) {
    node = $('.navbar');
     var st = $(this).scrollTop();
     if (st > lastScrollTop){
         if (scrollDown == false && st > 150) {
           scrollDown = true;
           animate(node, 'hide-up',  { duration : parseInt(timers.ANIMATION_DURATION * 2.5), easing : "ease-in"  });
         }
     } else {
        if (scrollDown == true) {
          scrollDown = false;
          animate(node, 'show-down', { duration : parseInt(timers.ANIMATION_DURATION * 2.5), easing : "ease-out"});
        }
     }
     lastScrollTop = st;
  });
};

Template.navigation.onRendered = function onRender() {
}

Template.navigation.helpers({
  screen: function () {
    if (Session.get('navbar')) {
      document.title = stripHTMLfromText(TAPi18n.__('democracy-of') + ' ' + Meteor.settings.public.Collective.name + ' - ' + Session.get('navbar').title);
      return Session.get('navbar').title;
    } else {
      document.title = stripHTMLfromText(TAPi18n.__('democracy-earth'));
    }
  },
  icon: function () {
    if (Session.get('navbar') != undefined) {
      return displayMenuIcon();
    } else {
      return 'images/burger.png';
    }
  },
  link: function () {
    if (Session.get('navbar')) {
      return Session.get('navbar').href;
    }
  },
  showNotice: function () {
    return Session.get('showNotice');
  }
});

Template.navigation.events({
  "click #menu": function (event) {
    if (Session.get('navbar').action == 'SIDEBAR') {
      toggleSidebar();
    }
  }
})

function displayMenuIcon() {
  if (Session.get('sidebar')) {
    return 'images/burger-active.png';
  } else {
    return 'images/burger.png';
  }
}

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';

import { timers, gui } from '/lib/const';
import { editorFadeOut } from '/imports/ui/templates/components/decision/editor/editor';
import { sidebarWidth } from '/imports/ui/modules/menu';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';

import '/imports/ui/templates/layout/authentication/authentication.js';
import '/imports/ui/templates/layout/navigation/navigation.html';
import '/imports/ui/templates/widgets/notice/notice.js';

// Scroll behaviour
let lastScrollTop = 0;
let scrollDown = false;

function hideBar() {
  if (Meteor.Device.isPhone()) {
    $('.right').scroll(() => {
      const node = $('.navbar');
      const st = $('.right').scrollTop();
      if (st > lastScrollTop && st > 60) {
        $('.tab-menu').removeClass('tab-menu-scroll');
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
        $('.tab-menu').addClass('tab-menu-scroll');
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
  } else {
    $('.navbar').css('position', 'fixed');
  }
}

/**
* @summary verifies if current screen should have back button on navbar
*/
function displayBackButton() {
  return false;
}

/**
* @summary verifies if editor mode is on in mobile devices
*/
function displayCancelButton() {
  return (Meteor.Device.isPhone() && Session.get('showPostEditor'));
}

function displayMenuIcon() {
  if (displayCancelButton()) {
    return 'images/cross.png';
  } else if (displayBackButton()) {
    return 'images/back.png';
  }
  if (Session.get('sidebar')) {
    return 'images/burger-active.png';
  }
  return 'images/burger.png';
}

/**
* @summary verifies if user is currently at remove-option
*/
const _isRoot = () => {
  return (Router.current().params.username === undefined && Router.current().params.hashtag === undefined);
};

Template.navigation.onCreated(function () {
  Session.set('enableSidebar', false);
  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.navigation.onRendered(() => {
  hideBar();
});

Template.navigation.helpers({
  screen() {
    return '';
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
  logo() {
    return true;
  },
  navIcon() {
    return Meteor.settings.public.app.logo;
  },
  icon() {
    return displayMenuIcon();
  },
  phoneScreen() {
    return (Meteor.Device.isPhone() || Session.get('miniWindow'));
  },
});

const _toggle = () => {
  const sidebarPixelWidth = sidebarWidth();

  // show sidebar
  if (!Session.get('enableSidebar')) {
    let newRight = 0;
    if ($(window).width() < gui.MOBILE_MAX_WIDTH) {
      newRight = parseInt(0 - sidebarPixelWidth, 10);
    }
    $('.mobile-menu').css('margin-top', '-55px');
    $('.mobile-menu').css('position', 'absolute');
    $('.mobile-menu').css('top', `${$('#content').scrollTop() + $(window).height()}px`);
    $('.navbar').css('position', 'absolute');
    $('.navbar').css('top', `${$('#content').scrollTop()}px`);
    $('.inhibitor').css('display', 'block');
    $('.inhibitor').css('position', 'fixed');
    $('.inhibitor').css('left', `${sidebarPixelWidth}px`);
    $('.content').css('overflow', 'hidden');
    $('#menu').css({ width: `${sidebarPixelWidth}px` });


    $('#menu').css({ marginLeft: '0px' });
    $('#content').css({
      left: sidebarPixelWidth,
      right: newRight,
    });
    Session.set('enableSidebar', true);

  // hide sidebar
  } else {
    Session.set('enableSidebar', false);
    $('.inhibitor').css('display', 'none');
    $('.navbar').css('position', 'fixed');
    $('.navbar').css('top', '0px');
    $('#menu').css({ marginLeft: parseInt(0 - sidebarPixelWidth, 10) });
    $('#content').css({
      left: 0,
      right: 0,
    });
  }
};

Template.navigation.events({
  'click #burger'() {
    if (displayCancelButton()) {
      editorFadeOut(Session.get('draftContract')._id);
      Session.set('showPostEditor', false);
    } else if (displayBackButton()) {
      window.history.back();
    } else {
      _toggle();
    }
  },
});

export const toggle = _toggle;

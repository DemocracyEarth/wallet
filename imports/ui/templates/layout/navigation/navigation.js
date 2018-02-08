import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { Router } from 'meteor/iron:router';

import { editorFadeOut } from '/imports/ui/templates/components/decision/editor/editor';
import { timers } from '/lib/const';
import { stripHTMLfromText } from '/imports/ui/modules/utils';
import { toggleSidebar } from '/imports/ui/modules/menu';
import { showFullName } from '/imports/startup/both/modules/utils';

import './navigation.html';
import '../authentication/authentication.js';
import '../../widgets/notice/notice.js';

// Scroll behaviour
let lastScrollTop = 0;
let scrollDown = false;

function hideBar() {
  if (Meteor.Device.isPhone()) {
    $('.right').scroll(() => {
      const node = $('.navbar');
      const st = $('.right').scrollTop();
      if (st > lastScrollTop && st > 60) {
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
  return (Router.current().url === '/' || Router.current().params.username === undefined);
};

Template.navigation.onRendered(() => {
  hideBar();
});

Template.navigation.helpers({
  screen() {
    if (Router.current().params.username) {
      const user = Meteor.users.findOne({ username: Router.current().params.username });
      if (user) {
        return showFullName(user.profile.firstName, user.profile.lastName, user.username);
      }
    }
    return '';
  },
  logo() {
    if (_isRoot()) {
      return true;
    }
    return false;
  },
  icon() {
    return displayMenuIcon();
  },
});

Template.navigation.events({
  'click #menu'() {
    if (displayCancelButton()) {
      editorFadeOut(Session.get('draftContract')._id);
      Session.set('showPostEditor', false);
    } else if (displayBackButton()) {
      window.history.back();
    } else {
      toggleSidebar();
    }
  },
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { gui } from '/lib/const';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { sidebarWidth, sidebarPercentage, toggleSidebar } from '/imports/ui/modules/menu';

import '/imports/ui/templates/layout/sidebar/sidebar.html';
import '/imports/ui/templates/components/collective/collective.js';
import '/imports/ui/templates/widgets/inbox/inbox.js';

/**
* @summary draws the sidebar if activated
*/
function drawSidebar() {
  if (Session.get('sidebar') === true && $('#menu').css('margin-left') === `-${sidebarPercentage()}%`) {
    Session.set('sidebar', false);
  }
}

/**
* @summary displays the sidebar if logged
*/
const _showSidebar = () => {
  const percentage = sidebarPercentage();
  if (!Meteor.Device.isPhone()) {
    if ($(window).width() < gui.MOBILE_MAX_WIDTH) {
      $('.navbar').css('left', 0);
      Session.set('miniWindow', true);
    } else {
      $('.navbar').css('left', `${percentage}%`);
      Session.set('miniWindow', false);
    }
    if (($(window).width() < gui.MOBILE_MAX_WIDTH && Session.get('sidebar')) || ($(window).width() >= gui.MOBILE_MAX_WIDTH && !Session.get('sidebar'))) {
      toggleSidebar(true);
    }
  } else {
    $('.left').width(`${percentage}%`);
  }
  if (!Session.get('sidebar')) {
    const newMargin = parseInt((Meteor.Device.isPhone() ? 0 : -10) - sidebarWidth(), 10);
    $('#menu').css('margin-left', `${newMargin}px`);
    if (newMargin < 0) {
      Session.set('removedSidebar', true);
    }
  } else {
    let newRight = 0;
    if ($(window).width() < gui.MOBILE_MAX_WIDTH) {
      newRight = parseInt(0 - sidebarWidth(), 10);
    }

    if (Meteor.Device.isPhone()) {
      $('#content').css('left', sidebarWidth());
      $('#content').css('right', newRight);
      $('#menu').css('margin-left', '0px');
    }

    if (Session.get('removedSidebar') && !Meteor.Device.isPhone()) {
      $('#menu').css('margin-left', `${0}px`);
      Session.set('removedSidebar', false);
    }
  }
};

Template.sidebar.onCreated(function () {
  Template.instance().menu = new ReactiveVar();
  Template.instance().resizing = false;
});

let resizeId;

Template.sidebar.onRendered(() => {
  if (!Meteor.Device.isPhone()) {
    $('.navbar').css('left', `${sidebarPercentage()}%`);
  }
  Session.set('sidebar', true);
  Session.set('removedSidebar', true);
  drawSidebar();

  const instance = Template.instance();

  $(window).resize(() => {
    instance.resizing = true;
    clearTimeout(resizeId);
    if (!Meteor.Device.isPhone()) {
      Session.set('sidebar', true);
      _showSidebar();
    }
  });
});

Template.sidebar.helpers({
  delegate() {
    return Template.instance().delegates.get();
  },
  participant() {
    return Template.instance().participants.get();
  },
  member() {
    return Template.instance().members.get();
  },
  members() {
    const count = Template.instance().memberCount.get();
    if (count === 1) {
      return `${count} ${TAPi18n.__('moloch-address')}`;
    }
    return `${count} ${TAPi18n.__('moloch-addresses')}`;
  },
  totalMembers() {
    if (Template.instance().members.get()) {
      return Template.instance().members.get().length;
    }
    return 0;
  },
  replicator() {
    return `<a href="${Meteor.settings.public.web.sites.tokens}" target="_blank" ontouchstart="">${TAPi18n.__('start-a-democracy')}</a>`;
  },
  totalDelegates() {
    if (Template.instance().delegates.get()) {
      return Template.instance().delegates.get().length;
    }
    return 0;
  },
  menu() {
    return Session.get('sidebarMenu');
  },
  style() {
    if (!Meteor.Device.isPhone() && Meteor.user()) {
      return 'left-edit';
    }
    return '';
  },
  sidebarContext() {
    const instance = Template.instance();
    if (!Meteor.Device.isPhone() && !instance.resizing) {
      Session.set('sidebar', true);
      _showSidebar();
    }
    return true;
  },
  sidebarStyle() {
    if (!Meteor.Device.isPhone()) {
      return 'sidebar-desktop';
    }
    return '';
  },
});

export const showSidebar = _showSidebar;

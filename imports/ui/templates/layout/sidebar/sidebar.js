import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { gui } from '/lib/const';
import { TAPi18n } from 'meteor/tap:i18n';

import { sidebarWidth, sidebarPercentage, getDelegatesMenu } from '/imports/ui/modules/menu';
import { showFullName } from '/imports/startup/both/modules/utils';
import { getFlag } from '/imports/ui/templates/components/identity/avatar/avatar';

import './sidebar.html';
import '../../components/collective/collective.js';
import '../../widgets/inbox/inbox.js';

/**
* @summary draws the sidebar if activated
*/
function drawSidebar() {
  if (Session.get('sidebar') === true && $('#menu').css('margin-left') === `-${sidebarPercentage()}%`) {
    Session.set('sidebar', false);
  }
}

function labelName(user) {
  let name = `${showFullName(user.profile.firstName, user.profile.lastName, user.username)} ${getFlag(user.profile, true)}`;
  if (user._id === Meteor.userId()) {
    name += ` <span class='sidebar-tag'>${TAPi18n.__('you')}</span>`;
  }
  return name;
}

/**
* @summary translates db object to a menu ux object
* @param {object} user database user object
*/
function dataToMenu(user) {
  return {
    id: user._id,
    label: labelName(user),
    icon: user.profile.picture,
    iconActivated: false,
    feed: 'user',
    value: true,
    separator: false,
    url: `/peer/${user.username}`,
    selected: false,
  };
}

/**
* @summary for a given db result returns list with menu options
* @param {object} db data to parse for menu options
*/
function getList(db) {
  const members = [];
  for (const i in db) {
    members.push(dataToMenu(db[i]));
  }
  return _.sortBy(members, (user) => { return user.label; });
}

/**
* @summary gets list of delegats for current user
*/
function getDelegates() {
  const delegates = getDelegatesMenu();
  const delegateList = [];
  for (const i in delegates) {
    delegateList.push(Meteor.users.find({ _id: delegates[i] }).fetch()[0]);
  }
  return getList(delegateList);
}

Template.sidebar.onRendered(() => {
  $('.left').width(`${sidebarPercentage()}%`);

  drawSidebar();

  $(window).resize(() => {
    $('.left').width(`${sidebarPercentage()}%`);
    if (!Session.get('sidebar')) {
      $('#menu').css('margin-left', `${parseInt(0 - sidebarWidth(), 10)}px`);
    } else {
      let newRight = 0;
      if ($(window).width() < gui.MOBILE_MAX_WIDTH) {
        newRight = parseInt(0 - sidebarWidth(), 10);
      }
      $('#content').css('left', sidebarWidth());
      $('#content').css('right', newRight);
    }
  });
});

Template.sidebar.helpers({
  decisions() {
    return Session.get('menuDecisions');
  },
  personal() {
    return Session.get('menuPersonal');
  },
  delegate() {
    return getDelegates();
  },
  member() {
    return getList(Meteor.users.find().fetch());
  },
  totalMembers() {
    return Meteor.users.find().count();
  },
  totalDelegates() {
    return getDelegates().count();
  },
});

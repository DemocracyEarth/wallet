import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { gui } from '/lib/const';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

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
    delegateList.push(Meteor.users.find({ _id: delegates[i].userId }).fetch()[0]);
  }

  // display statistics of delegate
  const inboxList = getList(delegateList);
  for (const item in inboxList) {
    for (const delegate in delegateList) {
      if ((inboxList[item].id === delegates[delegate].userId) && (delegates[delegate].sent > 0 || delegates[delegate].received > 0)) {
        inboxList[item].label += ` <span class='sidebar-tag'>${parseInt((delegates[delegate].sent + delegates[delegate].received), 10)} ${TAPi18n.__('votes')}</span>`;
        break;
      }
    }
  }

  return inboxList;
}

/**
* @summary all members of the collective without the delegates
*/
const _otherMembers = () => {
  const members = getList(Meteor.users.find().fetch());
  const delegates = getDelegates();
  const finalList = [];
  let isDelegate;
  for (const id in members) {
    isDelegate = false;
    for (const del in delegates) {
      if (members[id].id === delegates[del].id) {
        isDelegate = true;
        break;
      }
    }
    if (!isDelegate) {
      finalList.push(members[id]);
    }
  }
  return finalList;
};

Template.sidebar.onCreated(function () {
  Template.instance().delegates = new ReactiveVar();
  Template.instance().members = new ReactiveVar();
});

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
  delegate() {
    Template.instance().delegates.set(getDelegates());
    return Template.instance().delegates.get();
  },
  member() {
    Template.instance().members.set(_otherMembers());
    return Template.instance().members.get();
  },
  totalMembers() {
    if (Template.instance().members.get()) {
      return Template.instance().members.get().length;
    }
    return 0;
  },
  totalDelegates() {
    if (Template.instance().delegates.get()) {
      return Template.instance().delegates.get().length;
    }
    return 0;
  },
});

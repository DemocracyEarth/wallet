import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { $ } from 'meteor/jquery';
import { Session } from 'meteor/session';
import { gui } from '/lib/const';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { sidebarWidth, sidebarPercentage, getDelegatesMenu, toggleSidebar } from '/imports/ui/modules/menu';
import { getFlag, getUser } from '/imports/ui/templates/components/identity/avatar/avatar';
import { getCoin } from '/imports/api/blockchain/modules/web3Util';
import { Collectives } from '/imports/api/collectives/Collectives';

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

function labelName(user) {
  let name = `${getFlag(user.profile, true)} ${user.username}`;
  if (user._id === Meteor.userId()) {
    name += ` <span class='sidebar-tag'>${TAPi18n.__('you')}</span>`;
  }
  return name;
}

/**
* @summary translates db object to a menu ux object
* @param {object} user database user object
*/
const _dataToMenu = (user) => {
  if (user) {
    return {
      id: user._id,
      label: labelName(user),
      icon: user.profile.picture,
      iconActivated: false,
      feed: 'user',
      value: true,
      separator: false,
      url: `/address/${user.username}`,
      selected: false,
    };
  }
  return undefined;
};

/**
* @summary for a given db result returns list with menu options
* @param {object} db data to parse for menu options
* @param {boolean} sort if do alphabetical sort or not
*/
function getList(db, sort) {
  const members = [];
  for (const i in db) {
    members.push(_dataToMenu(db[i]));
  }
  if (sort) {
    return _.sortBy(members, (user) => { return user.label; });
  }
  return members;
}

/**
* @summary gets list of delegats for current user
* @param {object} contractFeed
* @param {object} transactionFeed
*/
function getDelegates(contractFeed, transactionFeed) {
  const delegates = _.sortBy(getDelegatesMenu(contractFeed, transactionFeed), (user) => { return parseInt(0 - (user.sent + user.received), 10); });
  let delegateList = [];
  // let totalVotes = 0;
  for (const i in delegates) {
    if (!Meteor.users.find({ _id: delegates[i].userId }).fetch()[0]) {
      getUser(delegates[i].userId);
    } else {
      delegateList.push(Meteor.users.find({ _id: delegates[i].userId }).fetch()[0]);
    }
  }

  // remove duplicates
  let finalList = delegateList;
  for (let i = 0; i < delegateList.length; i += 1) {
    for (let k = 0; k < finalList.length; k += 1) {
      if (i !== k) {
        if (delegateList[k] && delegateList[i] && delegateList[i]._id === delegateList[k]._id) {
          finalList[k] = 'EMPTY';
        }
      }
    }
  }
  finalList = _.without(finalList, 'EMPTY');
  delegateList = finalList;

  return getList(delegateList, false);
}

/**
* @summary all members of the collective without the delegates
* @param {object} currentDelegates list of delegates
*/
const _otherMembers = (currentDelegates) => {
  const members = getList(Meteor.users.find({}, { limit: 10 }).fetch(), true);
  const delegates = currentDelegates;
  let finalList = [];
  let isDelegate;
  if (delegates !== undefined && delegates.length > 0) {
    for (const id in members) {
      isDelegate = false;
      for (const del in delegates) {
        if (delegates[del] !== undefined) {
          if (members[id].id === delegates[del].id) {
            isDelegate = true;
            break;
          }
        }
      }
      if (!isDelegate) {
        finalList.push(members[id]);
      }
    }
  } else {
    finalList = members;
  }
  return finalList;
};


/**
* @summary formats delegate list for sidebar menu
* @param {object} list list of delegates
*/
const _adapt = (list) => {
  const menu = [];
  for (let i = 0; i < list.length; i += 1) {
    menu.push(_dataToMenu(list[i]));
  }
  return menu;
};


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
    } else {
      $('#content').css('left', '250px');
    }

    if (Session.get('removedSidebar') && !Meteor.Device.isPhone()) {
      $('#menu').css('margin-left', `${0}px`);
      Session.set('removedSidebar', false);
    }
  }
};

Template.sidebar.onCreated(function () {
  Template.instance().delegates = new ReactiveVar();
  Template.instance().members = new ReactiveVar(0);
  Template.instance().participants = new ReactiveVar();
  Template.instance().memberCount = new ReactiveVar(0);
  Template.instance().daoList = new ReactiveVar();

  const instance = this;

  Meteor.call('userCount', function (error, result) {
    instance.memberCount.set(result);
  });
  const collectives = instance.subscribe('collectives', { view: 'daoList' });

  instance.autorun(function () {
    let delegateList;
    if (collectives.ready()) {
      Template.instance().daoList.set(Collectives.find().fetch());
    }
    if (Meteor.user()) {
      if (Meteor.user().profile.delegations && Meteor.user().profile.delegations.length > 0) {
        const subscription = instance.subscribe('delegates', { view: 'delegateList', items: _.pluck(Meteor.user().profile.delegations, 'userId') });

        if (subscription.ready()) {
          const delegates = [];
          for (let i = 0; i < Meteor.user().profile.delegations.length; i += 1) {
            delegates.push({ _id: Meteor.user().profile.delegations[i].userId });
          }
          delegateList = _adapt(Meteor.users.find({ $or: delegates }).fetch());
          Template.instance().delegates.set(delegateList);
          Template.instance().participants.set(_otherMembers(delegateList));
          _showSidebar();
        }
      }
    }
    if (!delegateList) {
      Template.instance().participants.set(_otherMembers());
    }
  });
});

/**
* @summary draws main menu for logged user
* @param {object} user to parse
* @returns {object} menu
*/
const _getMenu = () => {
  // dao feeds
  const menu = [];
  const daoList = Template.instance().daoList.get();

  let daoMenu;
  if (daoList && daoList.length > 0) {
    for (let h = 0; h < daoList.length; h += 1) {
      if (daoList[h].profile.menu && daoList[h].profile.menu.length > 0) {
        for (let j = 0; j < daoList[h].profile.menu.length; j += 1) {
          daoMenu = daoList[h].profile.menu[j];
          daoMenu.id = parseInt(menu.length - 1, 10);
          menu.push(daoMenu);
        }
      }
    }
  }

  // subjectivity
  return menu;
};

Template.sidebar.onCreated(function () {
  Template.instance().resizing = false;
});

let resizeId; 
const _doneResizing = (instance) => {
  const template = instance;
  // template.resizing = false;
};

Template.sidebar.onRendered(() => {
  // $('.left').width(`${sidebarPercentage()}%`);
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
    resizeId = setTimeout(_doneResizing(instance), 5000);
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
    return _getMenu();
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

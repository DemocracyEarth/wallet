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
      url: `/@${user.username}`,
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
  $('.left').width(`${percentage}%`);
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
  }
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
};

Template.sidebar.onCreated(function () {
  Template.instance().delegates = new ReactiveVar();
  Template.instance().members = new ReactiveVar(0);
  Template.instance().participants = new ReactiveVar();
  Template.instance().memberCount = new ReactiveVar(0);

  const instance = this;

  Meteor.call('userCount', function (error, result) {
    instance.memberCount.set(result);
  });

  instance.autorun(function () {
    let delegateList;
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
const _userMenu = (user) => {
  const MAX_LABEL_LENGTH = 20;

  const menu = [
    {
      id: 0,
      label: TAPi18n.__('menu-proposals'),
      icon: 'images/decision-proposals.png',
      iconActivated: 'images/decision-proposals-active.png',
      feed: 'user',
      value: true,
      separator: false,
      url: '/',
      selected: false,
    },
  ];

  const geo = Session.get('geo');

  if (user && geo) {
    // country feed
    if (user.profile.country) {
      const nation = _.where(geo.country, { code: user.profile.country.code })[0];
      menu.push({
        id: parseInt(menu.length, 10),
        // label: `${nation.emoji} ${(user.profile.country.name.length > MAX_LABEL_LENGTH) ? `${user.profile.country.name.substring(0, MAX_LABEL_LENGTH)}...` : user.profile.country.name}`,
        label: `${(user.profile.country.name.length > MAX_LABEL_LENGTH) ? `${user.profile.country.name.substring(0, MAX_LABEL_LENGTH)}...` : user.profile.country.name} ${nation.emoji}`,
        icon: 'images/decision-globe.png',
        iconActivated: 'images/decision-globe-active.png',
        feed: 'user',
        value: true,
        separator: false,
        url: `/${user.profile.country.code.toLowerCase()}`,
        selected: false,
      });
    }

    // token feeds
    let coin;
    if (user.profile.wallet.reserves && user.profile.wallet.reserves.length > 0) {
      for (let i = 0; i < user.profile.wallet.reserves.length; i += 1) {
        coin = getCoin(user.profile.wallet.reserves[i].token);
        if (coin && coin.name) {
          menu.push({
            id: parseInt(menu.length, 10),
            // label: `<span class="suggest-item suggest-token suggest-token-sidebar">${coin.code}</span> ${(coin.name.length > MAX_LABEL_LENGTH) ? `${coin.name.substring(0, MAX_LABEL_LENGTH)}...` : coin.name}`,
            label: `${(coin.name.length > MAX_LABEL_LENGTH) ? `${coin.name.substring(0, MAX_LABEL_LENGTH)}...` : coin.name}`,
            icon: 'images/decision-coin.png',
            iconActivated: 'images/decision-coin-active.png',
            feed: 'user',
            value: true,
            separator: false,
            url: `/$${coin.code.toLowerCase()}`,
            selected: false,
            displayToken: true,
            tokenColor: coin.color,
          });
        }
      }
    }
  }

  // subjectivity
  return menu;
};

/**
* @summary draws side bar according to context
* @returns {boolean} if sidebar is shown
*/
const _render = () => {
  console.log('resize');
  const context = (Meteor.Device.isPhone() || (!Meteor.Device.isPhone() && Meteor.user()));
  if ((!Meteor.Device.isPhone() && Meteor.user())) {
    console.log('trueeee');
    Session.set('sidebar', true);
    _showSidebar();
  } else if ((!Meteor.Device.isPhone() && !Meteor.user())) {
    $('.right').css('left', '0px');
  }
  return context;
};

Template.sidebar.onRendered(() => {
  $('.left').width(`${sidebarPercentage()}%`);
  if (!Meteor.Device.isPhone()) {
    $('.navbar').css('left', `${sidebarPercentage()}%`);
  }

  drawSidebar();

  $(window).resize(() => {
    _render();
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
      return `${count} ${TAPi18n.__('member')}`;
    }
    return `${count} ${TAPi18n.__('members')}`;
  },
  bitcoinAddress() {
    return Meteor.settings.public.Collective.profile.blockchain.Bitcoin.address;
  },
  bitcoinReceived() {
    return `<strong>4.35422053</strong> ${TAPi18n.__('received')}`;
  },
  bitcoinSent() {
    return `<strong>0.00000000</strong> ${TAPi18n.__('spent')}`;
  },
  totalMembers() {
    if (Template.instance().members.get()) {
      return Template.instance().members.get().length;
    }
    return 0;
  },
  replicator() {
    return `&#183; <a href="${Meteor.settings.public.web.sites.tokens}" target="_blank" ontouchstart="">${TAPi18n.__('start-a-democracy')}</a>`;
  },
  totalDelegates() {
    if (Template.instance().delegates.get()) {
      return Template.instance().delegates.get().length;
    }
    return 0;
  },
  menu() {
    return _userMenu(Meteor.user());
  },
  style() {
    if (!Meteor.Device.isPhone() && Meteor.user()) {
      return 'left-edit';
    }
    return '';
  },
  sidebarContext() {
    return _render();
  },
});

export const showSidebar = _showSidebar;

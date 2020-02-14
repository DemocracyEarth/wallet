import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { TAPi18n } from 'meteor/tap:i18n';
import { gui } from '/lib/const';

import { showFullName } from '/imports/startup/both/modules/utils';
import { Contracts } from '/imports/api/contracts/Contracts';
import { Transactions } from '/imports/api/transactions/Transactions';
import { getVotes } from '/imports/api/transactions/transaction';

import { animationSettings } from './animation';

/**
/* @summary for a specific section returns how many new items to signal as new in sidebar
/* @param {string} feed - feed name from url query
******/
const _getSectionValue = (feed) => {
  if (Meteor.user() !== null) {
    const menu = Meteor.user().profile.menu;
    if (menu !== undefined && menu.length > 0) {
      for (const item in menu) {
        if (menu[item].feed === feed) {
          return menu[item].newItems;
        }
      }
    }
  }
  return 0;
};

/**
/* @summary verifies selected object based on query param
/* @param {string} selection - item selected
/* @param {object} feed - feed to compare with
*/
const _verifySelection = (selection, feed) => {
  if (selection === feed) {
    // empty content if void
    Session.set('emptyContent', {
      label: TAPi18n.__(`empty-feed-label-${feed}`),
      detail: TAPi18n.__(`empty-feed-detail-${feed}`),
      contribute: TAPi18n.__(`empty-feed-contribute-${feed}`),
      url: `/vote/draft?kind=${feed}`,
    });

    if (typeof Session.get('sidebarMenuSelectedId') !== 'string') {
      return true;
    }
  }
  return false;
};

/**
/* @summary constructs object for decisions menu (aka main)
/* @param {string} feed - feed name from url query
*/
const _getDecisionsMenu = (feed) => {
  const menu = [];
  let username = String();

  if (Meteor.user() !== null) {
    username = Meteor.user().username;
  } else {
    username = 'anonymous';
    // TODO verify that for unlogged users I get anon proposals on feed
  }

  menu.push(
    {
      id: 0,
      label: TAPi18n.__('live-votes'),
      icon: 'images/decision-open.png',
      iconActivated: 'images/decision-open-active.png',
      feed: 'live-votes',
      value: _getSectionValue('live-votes'),
      separator: false,
      url: '/feed?stage=live&kind=vote&executionstatus=open',
      selected: _verifySelection('live-votes', feed),
    },
    {
      id: 1,
      label: TAPi18n.__('live-votes-peer'),
      icon: 'images/decision-vote.png',
      iconActivated: 'images/decision-vote-active.png',
      feed: 'live-votes-peer',
      value: _getSectionValue('live-votes-peer'),
      separator: false,
      url: `/feed?stage=live&kind=vote&peer=${username}`,
      selected: _verifySelection('live-votes-peer', feed),
    },
    {
      id: 2,
      label: TAPi18n.__('votes-finish-approved'),
      icon: 'images/decision-approved.png',
      iconActivated: 'images/decision-approved-active.png',
      feed: 'votes-finish-approved',
      value: _getSectionValue('votes-finish-approved'),
      separator: false,
      url: '/feed?stage=finish&kind=vote&executionstatus=approved',
      selected: _verifySelection('votes-finish-approved', feed),
    },
    {
      id: 3,
      label: TAPi18n.__('vote-drafts'),
      icon: 'images/decision-draft.png',
      iconActivated: 'images/decision-draft-active.png',
      feed: 'vote-drafts',
      value: _getSectionValue('vote-drafts'),
      separator: false,
      url: '/feed?stage=draft&kind=vote',
      selected: _verifySelection('vote-drafts', feed),
    },
    {
      id: 4,
      label: TAPi18n.__('votes-finish-rejected'),
      icon: 'images/decision-rejected.png',
      iconActivated: 'images/decision-rejected-active.png',
      feed: 'votes-finish-rejected',
      value: _getSectionValue('votes-finish-rejected'),
      separator: false,
      url: '/feed?stage=finish&kind=vote&executionstatus=rejected',
      selected: _verifySelection('votes-finish-rejected', feed),
    }
  );

  if (Meteor.user() === null || Meteor.settings.public.app.config.proposalDrafting === false) {
    // delete options for unlogged users TODO: improve this in a reasonable way.
    menu.splice(1, 1);
    menu.splice(2, 1);
  }

  _toggleSelectedItem(menu);
  Session.set('menuDecisions', menu);
  return menu;
};

/**
/* @summary checks if item already present in array
/* @param {string} id - id to search in array
/* @param {string} array - item list
*/
const _alreadyListed = (id, array) => {
  if (id === Meteor.user()._id) { return true; }
  for (const i in array) {
    if (array.length > 0) {
      if (array[i] === id) {
        return true;
      }
    }
  }
  return false;
};

/**
/* @summary searches inside a contract
*/
const _searchContract = (source, list) => {
  switch (source.kind) {
    case 'DELEGATION':
      for (const stamp in source.signatures) {
        const delegate = source.signatures[stamp]._id;
        if (!_alreadyListed(delegate, list)) {
          list.push(delegate);
        }
      }
      break;
    default:
      break;
  }
  return list;
};

/**
/* @summary gets a list of users given an array
*/
const getUserList = (array) => {
  const userList = [];
  let user = '';

  for (const i in array) {
    user = Meteor.users.findOne({ _id: array[i] });
    let labelUser;
    if (user !== undefined) {
      if (user.profile && user.profile.firstName && user.profile.lastName) {
        labelUser = showFullName(user.profile.firstName, user.profile.lastName);
      } else {
        labelUser = user.username;
      }
      userList.push({
        id: user._id,
        label: labelUser,
        icon: user.profile.picture,
        iconActivated: false,
        feed: 'user',
        value: true,
        separator: false,
        url: `/address/${user.username}`,
        selected: false,
      });
    } else {
      return false;
    }
  }
  return userList;
};

/**
* @summary constructs object for delegates menu (aka chat)
* @param {object} contractFeed
* @param {object} transactionFeed
* @return {object} an object with userId, received & sent delegations
*/
const _getDelegatesMenu = (contractFeed, transactionFeed) => {
  let users = [];
  let delegations = [];
  let sent;
  let received;
  let source;
  let contracts = [];
  const politics = [];

  // unilaterally received delegations
  if (Meteor.user()) {
    contracts = _.pluck(contractFeed, '_id');
  }

  // sent delegations
  const transactions = _.filter(transactionFeed,
    (item) => {
      if (contracts.length > 0) {
        for (const signed in contracts) {
          if (item.input.entityId === contracts[signed] || item.output.entityId === contracts[signed]) {
            return true;
          }
        }
      }
      return (item.input.entityId === Meteor.userId() || item.output.entityId === Meteor.userId());
    }, 0);


  if (transactions.length > 0) {
    delegations = _.uniq(_.pluck(transactions, 'contractId'));
    for (const i in delegations) {
      source = Contracts.findOne({ _id: delegations[i] });
      if (source !== undefined) {
        users = _searchContract(source, users);
        sent = getVotes(delegations[i], Meteor.userId());
        received = getVotes(delegations[i], users[users.length - 1]);
        if (parseInt(sent + received, 10) !== 0) {
          politics.push({
            userId: users[users.length - 1],
            sent,
            received,
          });
        }
      }
    }
  }

  return politics;
};

/**
/* constructs object for personal menu (custom for user)
/* NOTE: Momentairily depreacted.
/* @param {string} feed - feed name from url query
*/
const _getPersonalMenu = (feed) => {
  const menu = [];

  menu.push(
    {
      id: 6,
      label: TAPi18n.__('proposals'),
      icon: 'images/decision-proposals.png',
      iconActivated: 'images/decision-proposals-active.png',
      feed: 'proposals',
      value: Meteor.user().profile.menu.drafts,
      separator: false,
      url: '/filter?kind=vote&id=',
      selected: _verifySelection('proposals', feed),
    },
    {
      id: 7,
      label: TAPi18n.__('voted-issues'),
      icon: 'images/decision-vote.png',
      iconActivated: 'images/decision-vote-active.png',
      feed: 'voted',
      value: Meteor.user().profile.menu.drafts,
      separator: false,
      url: '/filter?kind=vote&id=',
      selected: _verifySelection('voted', feed),
    }
  );

  return menu;
};

/**
* @summary sets the percentage for the sidebar based on space for burger visibility
*/
const _sidebarPercentage = () => {
  if ($(window).width() < gui.SIDEBAR_WIDTH_MAX) {
    return parseInt((($(window).width() - 50) * 100) / $(window).width(), 10);
  }
  return parseInt((gui.SIDEBAR_WIDTH_MAX * 100) / $(window).width(), 10);
};

/**
* @summary dynamically set sidebar width based on window width.
* @return integer for pixels
*/
const _sidebarWidth = () => {
  return parseInt((($(window).width() * _sidebarPercentage()) / 100) + 1, 10);
};

/**
/* @summary animation for main menu toggle activation burger button
*/
const animateMenu = () => {
  const sidebarPixelWidth = _sidebarWidth();

  Session.set('sidebar', !Session.get('sidebar'));
  if (!Meteor.user() && !Meteor.Device.isPhone()) { Session.set('sidebar', false); }

  if (Session.get('sidebar')) {
    // show sidebar
    let newRight = 0;

    if ($(window).width() < gui.MOBILE_MAX_WIDTH) {
      newRight = parseInt(0 - sidebarPixelWidth, 10);
    }

    // loose mobile menu
    if (Meteor.Device.isPhone() || Session.get('miniWindow')) {
      $('.mobile-menu').css('margin-top', '-55px');
      $('.mobile-menu').css('position', 'absolute');
      $('.mobile-menu').css('top', `${$('#content').scrollTop() + $(window).height()}px`);
      $('.navbar').css('position', 'absolute');
      $('.navbar').css('top', `${$('#content').scrollTop()}px`);
      $('.inhibitor').css('display', 'block');
      $('.inhibitor').css('position', 'fixed');
      $('.inhibitor').css('left', `${sidebarPixelWidth}px`);
      if (Meteor.Device.isPhone()) {
        $('.content').css('overflow', 'hidden');
        $('#menu').css({ width: `${sidebarPixelWidth}px` });
      }
    }

    $('#menu').css({ marginLeft: '0px' });
    $('#content').css({
      left: sidebarPixelWidth,
      right: newRight,
    });
  } else if (Meteor.Device.isPhone() || Session.get('miniWindow')) {
    // hide sidebar
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

/**
/* stores the current selected item in case of refresh
/* @param {array} arrMenu - arry items from menu
******/
const _toggleSelectedItem = (arrMenu) => {
  const menu = arrMenu;
  if (Session.get('sidebarMenuSelectedId')) {
    for (const item in menu) {
      if (menu[item].id === Session.get('sidebarMenuSelectedId')) {
        menu[item].selected = true;
      } else {
        menu[item].selected = false;
      }
    }
    return menu;
  }
  return false;
};


export const getDelegatesMenu = _getDelegatesMenu;
export const toggleSelectedItem = _toggleSelectedItem;
export const toggleSidebar = animateMenu;
export const sidebarWidth = _sidebarWidth;
export const sidebarPercentage = _sidebarPercentage;

import {default as Modules} from "./_modules";

/*****
/* @param {string} location - everything that comes after window.host.location, ie: '/filter?kind=membership'
******/
let createMenu = (feed) => {
  //Inbox Menu
  var stateMenu = new Array();

  /*      {
          id: 3,
          label: TAPi18n.__('memberships'),
          value: Meteor.user().profile.menu.memberships,
          separator: false,
          url: '/filter?kind=membership',
          selected: _verifySelection('membership', feed)
        },
        {
          id: 4,
          label: TAPi18n.__('delegations'),
          value: Meteor.user().profile.menu.delegations,
          separator: false,
          url: '/filter?kind=delegation',
          selected: _verifySelection('delegation', feed)
        },*/

  if (Meteor.user() != undefined) {
    stateMenu.push(
      {
        id: 0,
        label: TAPi18n.__('decisions'),
        separator: true,
      },
      {
        id: 1,
        label: TAPi18n.__('open'),
        value: Meteor.user().profile.menu.votes,
        icon: 'images/decision-open.png',
        iconActivated: 'images/decision-open-active.png',
        separator: false,
        url: '/',
        selected: _verifySelection('all', feed)
      },
      {
        id: 2,
        label: TAPi18n.__('approved'),
        icon: 'images/decision-approved.png',
        iconActivated: 'images/decision-approved-active.png',
        value: 0,
        separator: false,
        url: '/filter?stage=approved',
        selected: _verifySelection('approved', feed)
      },
      {
        id: 3,
        label: TAPi18n.__('closed'),
        icon: 'images/decision-closed.png',
        iconActivated: 'images/decision-closed-active.png',
        value: 0,
        separator: false,
        url: '/filter?stage=closed',
        selected: _verifySelection('closed', feed)
      },
      {
        id: 4,
        label: TAPi18n.__('drafts'),
        icon: 'images/decision-draft.png',
        iconActivated: 'images/decision-draft-active.png',
        value: Meteor.user().profile.menu.drafts,
        separator: false,
        url: '/filter?stage=draft',
        selected: _verifySelection('draft', feed)
      },
      {
        id: 5,
        label: TAPi18n.__('my-decisions'),
        separator: true,
      },
      {
        id: 6,
        label: TAPi18n.__('proposals'),
        icon: 'images/decision-proposals.png',
        iconActivated: 'images/decision-proposals-active.png',
        value: Meteor.user().profile.menu.drafts,
        separator: false,
        url: '/filter?kind=vote&id=',
        selected: _verifySelection('proposals', feed)
      },
      {
        id: 7,
        label: TAPi18n.__('voted-issues'),
        icon: 'images/decision-vote.png',
        iconActivated: 'images/decision-vote-active.png',
        value: Meteor.user().profile.menu.drafts,
        separator: false,
        url: '/filter?kind=vote&id=',
        selected: _verifySelection('voted', feed)
      },
      {
        id: 8,
        label: TAPi18n.__('delegates'),
        separator: true,
      }
    );
  }

  return stateMenu;
}

let _verifySelection = (selection, feed) => {
  if (selection == feed) {

    //Empty content if void
    Session.set('emptyContent', {
      label: TAPi18n.__('empty-feed-label-' + feed),
      detail: TAPi18n.__('empty-feed-detail-' + feed),
      contribute: TAPi18n.__('empty-feed-contribute-' + feed),
      url: '/vote/draft?kind=' + feed
    });

    return true;
  } else {
    return false;
  }
}


Modules.client.setMenu = createMenu;

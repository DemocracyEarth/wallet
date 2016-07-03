/*****
/* @param {string} location - everything that comes after window.host.location, ie: '/filter?kind=membership'
******/
let createMenu = (feed) => {
  //Inbox Menu
  var stateMenu = new Array();

  if (Meteor.user() != undefined) {
    stateMenu.push(
      {
        id: 0,
        label: TAPi18n.__('all'),
        value: Meteor.user().profile.menu.votes,
        url: '/',
        selected: _verifySelection('all', feed)
      },
      {
        id: 1,
        label: TAPi18n.__('memberships'),
        value: Meteor.user().profile.menu.memberships,
        url: '/filter?kind=membership',
        selected: _verifySelection('membership', feed)
      },
      {
        id: 2,
        label: TAPi18n.__('delegations'),
        value: Meteor.user().profile.menu.delegations,
        url: '/filter?kind=delegation',
        selected: _verifySelection('delegation', feed)
      },
      {
        id: 3,
        label: TAPi18n.__('drafts'),
        value: Meteor.user().profile.menu.drafts,
        url: '/filter?stage=draft',
        selected: _verifySelection('draft', feed)
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
      url: '/',
      icon: '/'
    });

    return true;
  } else {
    return false;
  }
}


Modules.client.setMenu = createMenu;

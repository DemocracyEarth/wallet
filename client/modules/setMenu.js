/*****
/* @param {string} location - everything that comes after window.host.location, ie: '/filter?kind=membership'
******/
let createMenu = (location) => {
  //Inbox Menu
  var stateMenu = new Array();

  if (Meteor.user() != undefined) {
    stateMenu.push(
      {
        id: 0,
        label: TAPi18n.__('all'),
        value: Meteor.user().profile.menu.votes,
        url: '/',
        selected: ('/' == location)
      },
      {
        id: 1,
        label: TAPi18n.__('memberships'),
        value: Meteor.user().profile.menu.memberships,
        url: '/filter?kind=membership',
        selected: ('/filter?kind=membership' == location)
      },
      {
        id: 2,
        label: TAPi18n.__('delegations'),
        value: Meteor.user().profile.menu.delegations,
        url: '/filter?kind=delegation',
        selected: ('/filter?kind=delegation' == location)
      },
      {
        id: 3,
        label: TAPi18n.__('drafts'),
        value: Meteor.user().profile.menu.drafts,
        url: '/filter?stage=draft',
        selected: _verifySelection('/filter?stage=draft', location)
      }
    );
  }

  return stateMenu;
}

let _verifySelection = (selection, location) => {
  if (selection == location) {

    return true;
  } else {
    return false;
  }
}

let _getQueryParams = (qs) => {
    qs = qs.split('+').join(' ');

    var params = {},
        tokens,
        re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
}


Modules.client.setMenu = createMenu;

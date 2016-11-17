import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { $ } from 'meteor/jquery';
import { TAPi18n } from 'meteor/tap:i18n';

import { Contracts } from '/imports/api/contracts/Contracts';
import { animationSettings } from './animation';


/**
/* builds the menu for the sidebar
/* @param {string} feed - option selected from url query.
******/
let sidebarMenu = (feed) => {

  //general
  _getDecisionsMenu(feed);

  //specific to user
  if (Meteor.user() != null) {
    _getDelegatesMenu(feed);
  } else {
    Session.set('menuDelegates', undefined);
  }

}

/*****
/* stores the current selected item in case of refresh
/* @param {array} arrMenu - arry items from menu
******/
let _toggleSelectedItem = (arrMenu) => {
  if (Session.get('sidebarMenuSelectedId')) {
    for (item in arrMenu) {
      if (arrMenu[item].id == Session.get('sidebarMenuSelectedId')) {
        arrMenu[item].selected = true;
      } else {
        arrMenu[item].selected = false;
      }
    }
    return arrMenu;
  }
}

/*****
/* constructs object for delegates menu (aka chat)
/* @param {string} feed - feed name from url query
******/
let _getDelegatesMenu = (feed) => {
  var users = new Array();
  var wallet = Meteor.user().profile.wallet.ledger;

  //search wallet
  for (entity in wallet) {
    switch(wallet[entity].entityType) {
      case 'CONTRACT':
        var source = Contracts.findOne({ _id: wallet[entity].entityId });
        if (source != undefined) {
          users = _searchContract(source, users);
        }
        break;
    }
  }

  //search contracts
  var contracts = Contracts.find({ collectiveId: Meteor.settings.public.Collective._id,  signatures: { $elemMatch: { username: Meteor.user().username }}}).fetch();
  for (i in contracts) {
    users = _searchContract(contracts[i], users)
  };

  //get delegators to me
  Meteor.call('getUserList', users, function (error, data) {
    if (error)
      console.log(error);

    _toggleSelectedItem(data);
    Session.set('menuDelegates', data);
  });

}

let _searchContract = (source, list) => {
  switch(source.kind) {
    case 'DELEGATION':
      for (stamp in source.signatures) {
        var delegate = source.signatures[stamp]._id;
        if (!_alreadyListed(delegate, list)) {
          list.push(delegate);
        }
      }
      break;
  }
  return list;
}

/*****
/* checks if item already present in array
/* @param {string} id - id to search in array
/* @param {string} array - item list
******/
let _alreadyListed = (id, array) => {
  if (id == Meteor.user()._id) { return true };
  for (i in array) {
    if (array.length > 0) {
      if (array[i] == id) {
        return true;
      }
    }
  }
  return false;
};


/*****
/* constructs object for decisions menu (aka main)
/* @param {string} feed - feed name from url query
******/
let _getDecisionsMenu = (feed) => {
  var menu = new Array();
  var username = new String();

  if (Meteor.user() != undefined) {
    username = Meteor.user().username;
  } else {
    username = 'anonymous';
    //TODO verify that for unlogged users I get anon proposals on feed
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
      url: '/feed?stage=' + 'LIVE'.toLowerCase() + '&kind=' + 'VOTE'.toLowerCase() + '&executionstatus=' + 'OPEN'.toLowerCase(),
      selected: _verifySelection('live-votes', feed)
    },
    {
      id: 1,
      label: TAPi18n.__('live-votes-peer'),
      icon: 'images/decision-vote.png',
      iconActivated: 'images/decision-vote-active.png',
      feed: 'live-votes-peer',
      value: _getSectionValue('live-votes-peer'),
      separator: false,
      url: '/feed?stage=' + 'LIVE'.toLowerCase() + '&kind=' + 'VOTE'.toLowerCase() + '&peer=' + username,
      selected: _verifySelection('live-votes-peer', feed)
    },
    {
      id: 2,
      label: TAPi18n.__('votes-finish-approved'),
      icon: 'images/decision-approved.png',
      iconActivated: 'images/decision-approved-active.png',
      feed: 'votes-finish-approved',
      value: _getSectionValue('votes-finish-approved'),
      separator: false,
      url: '/feed?stage=' + 'FINISH'.toLowerCase() + '&kind=' + 'VOTE'.toLowerCase() + '&executionstatus=' + 'APPROVED'.toLowerCase(),
      selected: _verifySelection('votes-finish-approved', feed)
    },
    {
      id: 3,
      label: TAPi18n.__('vote-drafts'),
      icon: 'images/decision-draft.png',
      iconActivated: 'images/decision-draft-active.png',
      feed: 'vote-drafts',
      value: _getSectionValue('vote-drafts'),
      separator: false,
      url: '/feed?stage=' + 'DRAFT'.toLowerCase() + '&kind=' + 'VOTE'.toLowerCase(),
      selected: _verifySelection('vote-drafts', feed)
    },
    {
      id: 4,
      label: TAPi18n.__('votes-finish-rejected'),
      icon: 'images/decision-rejected.png',
      iconActivated: 'images/decision-rejected-active.png',
      feed: 'votes-finish-rejected',
      value: _getSectionValue('votes-finish-rejected'),
      separator: false,
      url: '/feed?stage=' + 'FINISH'.toLowerCase() + '&kind=' + 'VOTE'.toLowerCase() + '&executionstatus=' + 'REJECTED'.toLowerCase(),
      selected: _verifySelection('votes-finish-rejected', feed)
    }
  );

  if (Meteor.user() == null || Meteor.settings.public.app.config.proposalDrafting == false) {
    //delete options for unlogged users
    menu.splice(1, 1);
    menu.splice(2, 1);
  }

  _toggleSelectedItem(menu);
  Session.set('menuDecisions', menu);
  return menu;

}

/*****
/* for a specific section returns how many new items to signal as new in sidebar
/* @param {string} feed - feed name from url query
******/
let _getSectionValue = (feed) => {
  if (Meteor.user() != undefined) {
    var menu = Meteor.user().profile.menu;
    if (menu != undefined && menu.length > 0) {
      for (item in menu) {
        if (menu[item].feed == feed) {
          return menu[item].newItems;
        }
      }
    } else {
      return 0;
    }
  }
}

/*****
/* constructs object for personal menu (custom for user)
/* NOTE: Momentairily depreacted.
/* @param {string} feed - feed name from url query
******/
let _getPersonalMenu = (feed) => {
  var menu = new Array();

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
      selected: _verifySelection('proposals', feed)
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
      selected: _verifySelection('voted', feed)
    }
  );

  return menu;

}

/*****
/* verifies selected object based on query param
/* @param {string} selection - item selected
/* @param {object} feed - feed to compare with
******/
let _verifySelection = (selection, feed) => {
  if (selection == feed) {

    //Empty content if void
    Session.set('emptyContent', {
      label: TAPi18n.__('empty-feed-label-' + feed),
      detail: TAPi18n.__('empty-feed-detail-' + feed),
      contribute: TAPi18n.__('empty-feed-contribute-' + feed),
      url: '/vote/draft?kind=' + feed
    });

    if (typeof Session.get('sidebarMenuSelectedId') != 'string') {
      return true;
    }
  } else {
    return false;
  }
}

/*****
/* animation for main menu toggle activation burger button
******/
let animateMenu = () => {
  //TODO make all strings showing pixels compliant with the device screen being used (aka mobiles)
  Session.set('sidebar', !Session.get('sidebar'));
  if (Session.get('sidebar')) {
    $('#menu').velocity({ marginLeft: '0px' }, animationSettings);
    $('#content').velocity({ left: '320px' }, animationSettings);
    $('.navbar').velocity({ left: '320px' }, animationSettings);
  } else {
    $('#menu').velocity({ marginLeft: '-320px' }, animationSettings);
    $('#content').velocity({ left: '0px' }, animationSettings);
    $('.navbar').velocity({ left: '0px' }, animationSettings);
  }
};

export const toggleSelectedItem = _toggleSelectedItem;
export const toggleSidebar = animateMenu;
export const setSidebarMenu = sidebarMenu;

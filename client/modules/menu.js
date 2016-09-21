import {default as Modules} from "./_modules";

/*****
/* builds the menu for the sidebar
/* @param {string} feed - option selected from url query.
******/
let sidebarMenu = (feed) => {

  var decisions = new Array();
  var delegates = new Array();

  if (Meteor.user() != undefined) {

    decisions = _getDecisionsMenu(feed);
    delegates = _getDelegatesMenu(feed);

  }

  if (feed == '' || feed == undefined) {
    if (Session.get('sidebarMenuSelectedId') != undefined) {
      decisions = _rememberSelectedItem(decisions);
    }
  }

  Session.set('menuDecisions', decisions);

}


/*****
/* stores the current selected item in case of refresh
/* @param {array} arrMenu - arry items from menu
******/
let _rememberSelectedItem = (arrMenu) => {
  for (item in arrMenu) {
    if (arrMenu[item].id == Session.get('sidebarMenuSelectedId')) {
      arrMenu[item].selected = true;
      break;
    }
  }
  return arrMenu;
}

/*****
/* constructs object for delegates menu (aka chat)
/* @param {string} feed - feed name from url query
******/
let _getDelegatesMenu = (feed) => {
  var users = new Array();
  var wallet = Meteor.user().profile.wallet.ledger;

  for (entity in wallet) {
    switch(wallet[entity].entityType) {
      case ENTITY_CONTRACT:
        var source = Contracts.findOne({ _id: wallet[entity].entityId });
        if (source != undefined) {
          switch(source.kind) {
            case KIND_DELEGATION:
              for (stamp in source.signatures) {
                var delegate = source.signatures[stamp]._id;
                if (!_alreadyListed(delegate, users)) {
                  users.push(delegate);
                }
              }
              break;
          }
          break;
        }
    }
  }

  Meteor.call('getUserList', users, function (error, data) {
    if (error)
      console.log(error);

    Session.set('menuDelegates', data);
  });

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

  menu.push(
    {
      id: 0,
      label: TAPi18n.__('manifest'),
      icon: 'images/decision-draft.png',
      iconActivated: 'images/decision-draft-active.png',
      feed: 'draft',
      value: _getSectionValue('draft'),
      separator: false,
      url: '/feed?stage=' + STAGE_DRAFT.toLowerCase() + '&kind=' + KIND_VOTE.toLowerCase(),
      selected: _verifySelection('draft', feed)
    },
    {
      id: 1,
      label: TAPi18n.__('open-vote'),
      value: Meteor.user().profile.menu.votes,
      icon: 'images/decision-open.png',
      iconActivated: 'images/decision-open-active.png',
      feed: _getSectionValue('all'),
      separator: false,
      url: '/feed?stage=' + STAGE_LIVE.toLowerCase() + '&kind=' + KIND_VOTE.toLowerCase() + '&execution=' + EXECUTION_STATUS_OPEN.toLowerCase(),
      selected: _verifySelection('all', feed)
    },
    {
      id: 2,
      label: TAPi18n.__('voted-issues'),
      icon: 'images/decision-vote.png',
      iconActivated: 'images/decision-vote-active.png',
      feed: 'voted',
      value: _getSectionValue('voted'),
      separator: false,
      url: '/feed?stage=' + STAGE_LIVE.toLowerCase() + '&kind=' + KIND_VOTE.toLowerCase() + '&citizen=' + Meteor.user().username,
      selected: _verifySelection('voted', feed)
    },
    {
      id: 3,
      label: TAPi18n.__('approved'),
      icon: 'images/decision-approved.png',
      iconActivated: 'images/decision-approved-active.png',
      feed: 'approved',
      value: _getSectionValue('approved'),
      separator: false,
      url: '/feed?stage=' + STAGE_FINISH.toLowerCase() + '&kind=' + KIND_VOTE.toLowerCase() + '&execution=' + EXECUTION_STATUS_APPROVED.toLowerCase(),
      selected: _verifySelection('approved', feed)
    }
  );

  return menu;

}

/*****
/* for a specific section returns how many new items to signal as new in sidebar
/* @param {string} feed - feed name from url query
******/
let _getSectionValue = (feed) => {
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

    return true;
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
    $('#menu').velocity({'marginLeft': '0px'}, Modules.client.animationSettings);
    $('#content').velocity({'left': '320px'}, Modules.client.animationSettings);
    $('.navbar').velocity({'left': '320px'}, Modules.client.animationSettings);
  } else {
    $('#menu').velocity({'marginLeft': '-320px'}, Modules.client.animationSettings);
    $('#content').velocity({'left': '0px'}, Modules.client.animationSettings);
    $('.navbar').velocity({'left': '0px'}, Modules.client.animationSettings);
  }
}

Modules.client.toggleSidebar = animateMenu;
Modules.client.setSidebarMenu = sidebarMenu;

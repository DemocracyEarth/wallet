import {default as Modules} from "./_modules";

/*****
/* builds the menu for the sidebar
/* @param {string} feed - option selected from url query.
******/
let sidebarMenu = (feed) => {

  //general
  _getDecisionsMenu(feed);

  //specific to user
  if (Meteor.user() != undefined) {
    _getDelegatesMenu(feed);
  }

}


/*****
/* stores the current selected item in case of refresh
/* @param {array} arrMenu - arry items from menu
******/
let _toggleSelectedItem = (arrMenu) => {
  if (Session.get('sidebarMenuSelectedId') != undefined) {
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

    _toggleSelectedItem(data);
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
      label: TAPi18n.__(FEED_VOTE_DRAFT),
      icon: 'images/decision-draft.png',
      iconActivated: 'images/decision-draft-active.png',
      feed: FEED_VOTE_DRAFT,
      value: _getSectionValue(FEED_VOTE_DRAFT),
      separator: false,
      url: '/feed?stage=' + STAGE_DRAFT.toLowerCase() + '&kind=' + KIND_VOTE.toLowerCase(),
      selected: _verifySelection(FEED_VOTE_DRAFT, feed)
    },
    {
      id: 1,
      label: TAPi18n.__(FEED_VOTE_LIVE),
      icon: 'images/decision-open.png',
      iconActivated: 'images/decision-open-active.png',
      feed: FEED_VOTE_LIVE,
      value: _getSectionValue(FEED_VOTE_LIVE),
      separator: false,
      url: '/feed?stage=' + STAGE_LIVE.toLowerCase() + '&kind=' + KIND_VOTE.toLowerCase() + '&execution=' + EXECUTION_STATUS_OPEN.toLowerCase(),
      selected: _verifySelection(FEED_VOTE_LIVE, feed)
    },
    {
      id: 2,
      label: TAPi18n.__(FEED_VOTE_LIVE_PEER),
      icon: 'images/decision-vote.png',
      iconActivated: 'images/decision-vote-active.png',
      feed: FEED_VOTE_LIVE_PEER,
      value: _getSectionValue(FEED_VOTE_LIVE_PEER),
      separator: false,
      url: '/feed?stage=' + STAGE_LIVE.toLowerCase() + '&kind=' + KIND_VOTE.toLowerCase() + '&peer=' + username,
      selected: _verifySelection(FEED_VOTE_LIVE_PEER, feed)
    },
    {
      id: 3,
      label: TAPi18n.__(FEED_VOTE_FINISH_APPROVED),
      icon: 'images/decision-approved.png',
      iconActivated: 'images/decision-approved-active.png',
      feed: FEED_VOTE_FINISH_APPROVED,
      value: _getSectionValue(FEED_VOTE_FINISH_APPROVED),
      separator: false,
      url: '/feed?stage=' + STAGE_FINISH.toLowerCase() + '&kind=' + KIND_VOTE.toLowerCase() + '&execution=' + EXECUTION_STATUS_APPROVED.toLowerCase(),
      selected: _verifySelection(FEED_VOTE_FINISH_APPROVED, feed)
    }
  );

  _toggleSelectedItem(menu);
  Session.set('menuDecisions', menu);
  return menu;

}

/*****
/* for a specific section returns how many new items to signal as new in sidebar
/* @param {string} feed - feed name from url query
******/
let _getSectionValue = (feed) => {
  if ( Meteor.user() != undefined) {
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

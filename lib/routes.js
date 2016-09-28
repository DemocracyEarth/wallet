/***
* router settings
****/
Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'load'
});

/***
* home route
****/
Router.route('/', {
  name: 'home',
  template: 'home',

  waitOn: function () {
    //Feed data will come from here:
    if (Meteor.settings.public.Collective) {
      return Meteor.subscribe('contracts', { collectiveId: Meteor.settings.public.Collective._id });
    }
  },
  onBeforeAction: function () {
    if (Meteor.settings.public.Collective) {
      _clearSessionVars();
      _configNavbar(Meteor.settings.public.Collective.name);
      _setSessionVars();
      Session.set('feed', Contracts.find({ collectiveId: Session.get('collectiveId'), stage: STAGE_LIVE, kind: KIND_VOTE, executionStatus: EXECUTION_STATUS_OPEN }, {sort: {timestamp: -1}}).fetch());
    };
    this.next();
  },
  onAfterAction: function () {
    _getExternalScripts();
  }
});

/***
* routing for feeds displaying contracts
* NOTE: called when item clicked on sidebar menu
****/
Router.route('/:feed', {
  name: 'homeFeed',
  template: 'home',
  waitOn: function () {
    return Meteor.subscribe('contracts', _buildQuery(this.params.query));
  },
  onBeforeAction: function () {
    _clearSessionVars();
    _configNavbar(_buildTitle(this.params.query));
    _setSessionVars(this.params);
    Session.set('feed', Contracts.find(_buildQuery(this.params.query), {sort: {timestamp: -1}}).fetch());
    this.next();
  },
  onAfterAction: function () {
    _getExternalScripts();
  }
});

/***
* loads a tag feed
****/
Router.route('/tag/:tag', {
  name: 'tagFeed',
  template: 'home',
  waitOn: function () {
    return Meteor.subscribe('contracts', _buildQuery(this.params));
  },
  onBeforeAction: function () {
    _clearSessionVars();
    _configNavbar(_buildTitle(this.params));
    _setSessionVars();
    Session.set('feed', Contracts.find(_buildQuery(this.params), {sort: {timestamp: -1}}).fetch());
    this.next();
  },
  onAfterAction: function () {
    _getExternalScripts();
  }
});

// TODO: figure out what to do when no param is given
Router.route('/peer', {
  name: 'peer',
  template: 'peer'
});

/***
* loads a peer feed
****/
Router.route('/peer/:username', {
  name: 'peerFeed',
  template: 'home',
  waitOn: function() {
    return Meteor.subscribe('contracts', _buildQuery(this.params));
  },
  onBeforeAction: function() {
    _clearSessionVars();
    _configNavbar(_buildTitle(this.params));
    _setSessionVars();
    Session.set('feed', Contracts.find(_buildQuery(this.params), {sort: {timestamp: -1}}).fetch());
    this.next();
  },
  onAfterAction: function () {
    _getExternalScripts();
  }
});


/***
* loads a contract meant for voting either to edit or vote.
****/
Router.route('/vote/:contract', {
  name: 'voteContract',
  template: 'contract',
  waitOn: function () {
    return Meteor.subscribe('contracts', _buildQuery(this.params.query));
  },
  onBeforeAction: function() {
    _clearSessionVars();
    _configNavbar(_buildTitle(this.params.contract))
    _setSessionVars(this.params);
    this.next();
  },
  onAfterAction: function () {
    _getExternalScripts();
  }
});

/***
* loads a contract meant for delegation of votes.
****/
Router.route('/delegation/:contract', {
  name: 'delegationContract',
  template: 'contract',
  waitOn: function () {
    return Meteor.subscribe('contracts', { keyword: this.params.contract });
  },
  onBeforeAction: function() {
    _clearSessionVars();
    _configNavbar(TAPi18n.__('navbar-delegation'));
    _setSessionVars(this.params);
    this.next();
  },
  onAfterAction: function () {
    _getExternalScripts();
  }
});

//Email routes
Router.route( '/verify-email/:token', {
  name: 'verify-email',
  onBeforeAction: function () {
    Session.set('emailToken', this.params.token);
    this.next();
  }
});

//Login
Router.route('/login', {
  name: 'login'
});


/*****************************
* private methods for effective routing
******************************/

/***
* from the paramaters obtained in a URL builds a query for the db
* @param {object} params - url querying object
* @return {object} query - returns a query with object ready for mongo
****/
let _buildQuery = (params) => {
  var query = new Object();
  query['collectiveId'] = Meteor.settings.public.Collective._id;
  for (key in params) {
    //strict type with contracts schema
    var dbKey = _matchType(key);
    if (dbKey != false) {
      if (key !== dbKey) {
        Object.defineProperty(params, dbKey,
            Object.getOwnPropertyDescriptor(params, key));
        delete params[key];
        key = dbKey;
      }
    }
    switch (key) {
      case 'id':
        query['_id'] = params[key];
        break;
      case 'keyword':
        query[key] = params[key];
        break;
      case 'tag':
        query['tags'] = {
          $elemMatch: {
            url: '/tag/' + params[key]
          }
        };
        break;
      case 'username':
      case 'peer':
        query['signatures'] = {
          $elemMatch: {
            username: params[key]
          }
        };
        break;
      case 'hash':
      case 'query':
        break;
      default:
        query[key] = params[key].toUpperCase();
    }
  }
  return query;
}

/***
* matches url param with db schema string accordingly
* @param {string} key - url querying object
****/
let _matchType = (key) => {
  var schema = Schema.Contract._firstLevelSchemaKeys;
  for (feat in schema) {
    if (schema[feat].toLowerCase() == key.toLowerCase()) {
      return schema[feat];
    }
  }
  return false;
}

/***
* generates section title based on url query
* @param {object} params - url querying object
* @return {string} title - returns title to fetch on json dictionary
****/
let _buildTitle = (params) => {
  var title = new String();
  if (typeof params == 'string') {
    if (params == 'draft') {
      title = 'navbar-' + params;
    } else {
      var contractTitle = Contracts.findOne({ keyword: params }).title;
      return TAPi18n.__('proposal') + ' <strong><em>' + contractTitle + '</em></strong>';
    }
  } else  {
    for (key in params) {
      if (title.length != 0) { title += '-'; }
      switch (key) {
        case 'tag':
          return '<strong><em>' + Tags.findOne({ keyword: params[key] }).text + '</em></strong> ' + TAPi18n.__('proposals');
        case 'username':
          //TODO builds string strictly from cache search, no request to server is ever done. Eventually might be needed.
          var profile = Modules.both.getProfileFromUsername(params[key]);
          if (profile) {
            var fullname = Modules.both.showFullName(profile.firstName, profile.lastName);
            return '<strong><em>' + fullname + '</em></strong> ' + TAPi18n.__('proposals');
          }
          return TAPi18n.__('peer') + ' ' + TAPi18n.__('proposals');
        case 'hash':
        case 'query':
          break;
        default:
          if (key != 'peer') {
            title += key + '-' + params[key]
          } else {
            title += key;
          }
        }
    }
  }
  return TAPi18n.__(title.toLowerCase());
}


/***
* set session variables for specific view based on query
* @param {object} query - url query
****/
let _setSessionVars = (params) => {
  if (params) {
    var query = params.query;
  }

  //collective
  if (Session.get('collective') == undefined) {
    Session.set('collectiveId', Meteor.settings.public.Collective._id);
    Session.set('collective', Collectives.findOne({ _id: Session.get('collectiveId')}));
  }

  //view
  if (!params) {
    var feed = FEED_VOTE_LIVE_CUSTOM;
    _loadFeed(feed);
  } else {
    if (params.contract) {
      var feed = _getMenuSelection(params.contract);
      _loadContract(params.contract, params.query.id);
    } else {
      var feed = _getQueryFeed(params.query);
      _loadFeed(feed);
    }
  }

  Modules.client.setSidebarMenu(feed);
}


/***
* loads a feed based on url query
* @param {object} query - query settings
****/
let _loadFeed = (feed) => {
  switch (feed) {
    case FEED_VOTE_LIVE:
      Session.set('voterMode', true);
      Session.set('editorMode', false);
      if (typeof Session.get('sidebarMenuSelectedId') != 'string') {
        Session.set('sidebarMenuSelectedId', 0);
      }
      break;
    case FEED_VOTE_LIVE_PEER:
      if (typeof Session.get('sidebarMenuSelectedId') != 'string') {
        Session.set('sidebarMenuSelectedId', 1);
      }
      break;
    case FEED_VOTE_FINISH_APPROVED:
      if (typeof Session.get('sidebarMenuSelectedId') != 'string') {
        Session.set('sidebarMenuSelectedId', 2);
      }
      break;
    case FEED_VOTE_DRAFT:
      Session.set('voterMode', false);
      Session.set('editorMode', true);
      if (typeof Session.get('sidebarMenuSelectedId') != 'string') {
        Session.set('sidebarMenuSelectedId', 3);
      }
      break;
    case FEED_VOTE_LIVE_CUSTOM:
      Session.set('voterMode', true);
      Session.set('editorMode', false);
      Session.set('emptyContent', {
        label: TAPi18n.__('empty-feed-label-' + feed),
        detail: TAPi18n.__('empty-feed-detail-' + feed),
        contribute: TAPi18n.__('empty-feed-contribute-' + feed),
        url: '/vote/draft?kind=' + feed
      });
      break;
  }
}

/***
* loads contract based on view as in url params
* @param {object} view - view to be used inferred from params
* @return {string} id - contract id to load
****/
let _loadContract = (view, id) => {
  //load contract
  if (id != undefined) {
    var contract = Contracts.findOne({ _id: id });
  } else {
    var contract = Contracts.findOne({ keyword: view });
  }

  if (contract != undefined) {
    //settings
    Session.set('contract', contract);
    Session.set("voteKeyword", view);
    Session.set('stage', contract.stage);
    //Modules.client.verifyVote(contract.wallet.ledger, Meteor.user()._id)); //NOTE: verify this

    //status of action button
    if (contract.kind == KIND_DELEGATION) {
      Session.set('rightToVote', Modules.both.verifyDelegationRight(contract.signatures))
    } else if (contract.kind == KIND_VOTE && contract.stage == STAGE_DRAFT ) {
      Session.set('rightToVote', true);
      Session.set('alreadyVoted', false);
    } else if (contract.kind == KIND_VOTE && contract.stage == STAGE_LIVE) {
      Session.set('rightToVote', Modules.both.verifyVotingRight(contract.wallet.ledger))
    }

    //wallet
    _setContractWallet(contract);

    //mode
    switch (contract.stage) {
      case STAGE_DRAFT:
        Session.set('editorMode', true);
        Session.set('voterMode', false);
        break;
      case STAGE_LIVE:
      default:
        Session.set('editorMode', false);
        Session.set('voterMode', true);
        break;
    }
  }
}

/****
* sets which wallet to use for reference in contract based on if the user appears asa signer or not
* @param {object} contract - contract to analyze
****/
let _setContractWallet = (contract) => {
  var userContract = false;
  var role = new String();
  for (i in contract.signatures) {
    if (contract.signatures[i]._id == Meteor.user()._id) {
      userContract = true;
      role = contract.signatures[i].role;
      break;
    }
  }
  if (userContract == true) {
    if (role == ROLE_DELEGATE) {
      Session.set('newVote', contract.wallet);
    } else {
      Session.set('newVote', new Wallet(Meteor.user().profile.wallet));
    }
  } else {
    Session.set('newVote', contract.wallet);
  }
}

/***
* loads external scripts if they're not loaded yet
****/
let _getExternalScripts = () => {
  if (typeof window.Spinner == 'undefined')  {
    jQuery.getScript('/js/spinner.js');
  };
  if (typeof window.datepicker == 'undefined')  {
    jQuery.getScript('/datepicker.js');
  };
}

/***
* main settings for navbar behaviour
* @param {string} title - title for it
****/
let _configNavbar = (title) => {
  if (Session.get('sidebar') == undefined) {
    Session.set('sidebar', true);
    Modules.client.toggleSidebar();
  }
  Session.set('navbar', {
    title: title,
    toggle: Session.get('sidebar'),
    href: '#',
    action: 'SIDEBAR'
  });
}

/***
* clears all sessions vars need to reset view
***/
let _clearSessionVars = () => {
  Session.set('contract', undefined);
  Session.set('newVote', undefined); //used for wallet (refactor name)
  Session.set('candidateBallot', undefined); //used for ballot
}

/***
* returns the selected feed from menu if unknown in mem
****/
let _getMenuSelection = (params) => {
  var menu = Session.get('menuDecisions');
  var delegates = Session.get('menuDelegates');
  var feed = _getMenuFeed(menu);
  if (!feed) {
    feed = _getMenuFeed(delegates);
    if (!feed) {
      switch (params) {
        case 'draft':
          feed = FEED_VOTE_DRAFT;
          break;
        default:
          feed = FEED_VOTE_LIVE;
      }
    }
  }
  return feed;
}

/***
* returns from a menu array the selected feed
* @param {object} menu - menu array
****/
let _getMenuFeed = (menu) => {
  if (Session.get('sidebarMenuSelectedId') && typeof Session.get('sidebarMenuSelectedId') != 'string') {
    var item = Session.get('sidebarMenuSelectedId');
    return menu[item].feed;
  } else {
    for (item in menu) {
      if (menu[item].selected == true) {
        return menu[item].feed;
      }
    }
  }
  return false;
}

/***
* based on the query returns proper feed to fetch
* @param {object} query - query settings
* @return {string} feed - feed name constant (false if not found)
* TODO: this whole switch can easily be done programatically, i don't have time now.
****/
let _getQueryFeed = (query) => {
  if (query == undefined) { return false };
  switch(query.stage.toUpperCase()) {
    case STAGE_DRAFT:
      switch(query.kind.toUpperCase()) {
        case KIND_VOTE:
          if (query.peer) {
            return FEED_VOTE_DRAFT_PEER;
          } else {
            return FEED_VOTE_DRAFT;
          }
        case KIND_DELEGATION:
          if (query.peer) {
            return FEED_DELEGATION_DRAFT_PEER;
          } else {
            return FEED_DELEGATION_DRAFT;
          }
        case KIND_MEMBERSHIP:
          if (query.peer) {
            return FEED_MEMBERSHIP_DRAFT_PEER;
          } else {
            return FEED_MEMBERSHIP_DRAFT;
          }
      }
      return FEED_DRAFTS;
    case STAGE_LIVE:
      switch(query.kind.toUpperCase()) {
        case KIND_VOTE:
          if (query.peer) {
            return FEED_VOTE_LIVE_PEER;
          } else {
            return FEED_VOTE_LIVE;
          }
        case KIND_DELEGATION:
          if (query.peer) {
            return FEED_DELEGATION_LIVE_PEER;
          } else {
            return FEED_DELEGATION_LIVE;
          }
        case KIND_MEMBERSHIP:
          if (query.peer) {
            return FEED_MEMBERSHIP_LIVE_PEER;
          } else {
            return FEED_MEMBERSHIP_LIVE;
          }
      }
      return FEED_LIVE;
    case STAGE_FINISH:
      switch(query.kind.toUpperCase()) {
        case KIND_VOTE:
          switch(query.executionStatus.toUpperCase()) {
            case EXECUTION_STATUS_APPROVED:
              if (query.peer) {
                return FEED_VOTE_FINISH_APPROVED_PEER;
              }
              return FEED_VOTE_FINISH_APPROVED;
            case EXECUTION_STATUS_REJECTED:
              if (query.peer) {
                return FEED_VOTE_FINISH_REJECTED_PEER;
              }
              return FEED_VOTE_FINISH_REJECTED;
            case EXECUTION_STATUS_ALTERNATIVE:
              if (query.peer) {
                return FEED_VOTE_FINISH_ALTERNATIVE_PEER;
              }
              return FEED_VOTE_FINISH_ALTERNATIVE;
          }
          return FEED_VOTE_FINISH;
        case KIND_DELEGATION:
          switch(query.executionStatus.toUpperCase()) {
            case EXECUTION_STATUS_APPROVED:
              if (query.peer) {
                return FEED_DELEGATION_FINISH_APPROVED_PEER;
              }
              return FEED_DELEGATION_FINISH_APPROVED;
            case EXECUTION_STATUS_REJECTED:
              if (query.peer) {
                return FEED_DELEGATION_FINISH_REJECTED_PEER;
              }
              return FEED_DELEGATION_FINISH_REJECTED;
          }
          return FEED_DELEGATION_FINISH;
        case KIND_MEMBERSHIP:
          switch(query.executionStatus.toUpperCase()) {
            case EXECUTION_STATUS_APPROVED:
              if (query.peer) {
                return FEED_MEMBERSHIP_FINISH_APPROVED_PEER;
              }
              return FEED_MEMBERSHIP_FINISH_APPROVED;
            case EXECUTION_STATUS_REJECTED:
              if (query.peer) {
                return FEED_MEMBERSHIP_FINISH_REJECTED_PEER;
              }
              return FEED_MEMBERSHIP_FINISH_REJECTED;
          }
          return FEED_MEMBERSHIP_FINISH;
      }
      return FEED_FINISH;
  }

}

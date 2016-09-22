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
      Meteor.subscribe('contracts', { collectiveId: Meteor.settings.public.Collective._id });
    }
  },
  onBeforeAction: function () {
    //Collective ID to be used
    if (Meteor.settings.public.Collective) {
      Session.set('voterMode', true);
      Session.set('sidebarMenuSelectedId', 0);
      Session.set('contract', {});
      _setSessionVars();
      _configNavbar(Meteor.settings.public.Collective.name);
      Session.set('feed', Contracts.find({ collectiveId: Session.get('collectiveId'), stage: { $ne: 'DRAFT' } }, {sort: {timestamp: -1} } ).fetch());
    };
    Modules.client.setSidebarMenu('all');
    this.next();
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
    Meteor.subscribe('contracts', _buildQuery(this.params.query));
  },
  onBeforeAction: function () {
    Session.set('contract', {});
    Session.set('feed', Contracts.find(_buildQuery(this.params.query), {sort: {timestamp: -1}}).fetch());
    _configNavbar(_buildTitle(this.params.query));
    _setSessionVars(this.params.query);
    this.next();
  },
  onAfterAction: function () {
    jQuery.getScript('/datepicker.js');
    jQuery.getScript('/js/spinner.js');
  }
});

/***
* loads a contract meant for voting either to edit or vote.
****/
Router.route('/vote/:contract', {

  name: 'voteContract',
  template: 'contract',

  waitOn: function () {
    console.log(_buildQuery(this.params.query));

    switch(this.params.contract) {
      case 'draft':
        return Meteor.subscribe('contracts', { _id: this.params.query.id });
        break;
      default:
        return Meteor.subscribe('contracts', { keyword: this.params.contract });
    }
  },

  onBeforeAction: function() {
    switch (this.params.contract) {
      case 'draft':
        if (this.params.query.id != undefined) {
          //Load contract with id
          var contract = Contracts.findOne({ _id: this.params.query.id });
          var currentDate = new Date();
          Session.set('alreadyVoted', false);
          Session.set('contractId', this.params.query.id);
          Session.set('contract', contract);
          Session.set('stage', 'draft');
          _configNavbar(TAPi18n.__('navbar-editor'));
          break;

        }
      default:
        //Load contract with keyword
        var contract = Contracts.findOne({ keyword: this.params.contract });
        Session.set('contractId', contract._id);
        Session.set('contract', contract);
        Session.set("voteKeyword", this.params.contract);
        Session.set('stage', contract.stage);
        _configNavbar(TAPi18n.__('navbar-proposal'));
    }
    Modules.client.setSidebarMenu('');
    _setSessionVars();
    this.next();
  },

  data: function () {

  },
  onData: function () {

  },
  onAfterAction: function () {
    jQuery.getScript('/datepicker.js');
    jQuery.getScript('/js/spinner.js');
  }
});


//Login
Router.route('/login', {
  name: 'login'
});



// Delegation Contracts.
Router.route('/delegation/:contract', {

  name: 'delegationContract',
  template: 'contract',

  waitOn: function () {
    return Meteor.subscribe('contracts', { keyword: this.params.contract });
  },

  onBeforeAction: function() {
    //Load contract with keyword
    var contract = Contracts.findOne({ keyword: this.params.contract });
    Session.set('contractId', contract._id);
    Session.set('contract', contract);
    Session.set("voteKeyword", this.params.contract);
    Session.set('stage', contract.stage);
    _configNavbar(TAPi18n.__('navbar-delegation'));
    Modules.client.setSidebarMenu('');
    _setSessionVars();
    this.next();
  },

  onAfterAction: function () {
    jQuery.getScript('/datepicker.js');
    jQuery.getScript('/js/spinner.js');
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


// Identities with right to vote and delegation.
Router.route('/peer', {
  name: 'peer',
  template: 'peer'
});

Router.route('/peer/:passport', {
  name: 'peerPassport',
  template: 'peer',
  waitOn: function() {
    console.log('[peer] waitOn: ' + this.params.passport);
  },
  onBeforeAction: function() {
    console.log('[peer] onBeforeAction: ' + this.params.passport);
    Session.set("usernameKeyword", this.params.contract);
    this.next();
  },
  data: function() {
    console.log('[peer] loading data for: ' + this.params.passport);
  }
});


Router.route('/tag/:organization', {
  template: 'organization',
  waitOn: function () {
    console.log('[tag] waitOn: ' + this.params.organization);
    return Meteor.subscribe('tags', { keyword: this.params.organization });
  },
  onBeforeAction: function () {
    console.log('[tag] onBeforeAction: ' + this.params.organization);
    Session.set("tagKeyword", this.params.organization);
    this.next();
  },
  data: function () {
    console.log('[tag] data: ' + this.params.organization);
  }
});


/***
* from the paramaters obtained in a URL builds a query for the db
* @param {object} params - url querying object
* @return {object} query - returns a query with object ready for mongo
****/
let _buildQuery = (params) => {
  var query = new Object();
  query['collectiveId'] = Meteor.settings.public.Collective._id;
  for (key in params) {
    query[key] = params[key].toUpperCase();
  }
  return query;
}

/***
* generates section title based on url query
* @param {object} params - url querying object
* @return {string} title - returns title to fetch on json dictionary
****/
let _buildTitle = (params) => {
  var title = new String();
  for (key in params) {
    if (title.length != 0) { title += '-'; }
    if (key != 'peer') {
      title += key + '-' + params[key]
    } else {
      title += key;
    }
  }
  return TAPi18n.__(title);
}


/***
* set session variables for specific view based on query
* @param {object} query - url query
****/
let _setSessionVars = (query) => {
  var feed = _getQueryFeed(query);

  //collective
  if (Session.get('collective') == undefined) {
    Session.set('collectiveId', Meteor.settings.public.Collective._id);
    Session.set('collective', Collectives.findOne({ _id: Session.get('collectiveId')}));
  }

  //sidebar menu
  if (Session.get('sidebarMenuSelectedId') == undefined) {
    Session.set('sidebarMenuSelectedId', 0);
  }
  Modules.client.setSidebarMenu(feed);

  //feed (context specific)
  switch (feed) {
    case FEED_VOTE_DRAFT:
      Session.set('voterMode', false);
      Session.set('editorMode', true);
      break;
    case FEED_VOTE_LIVE:
      Session.set('voterMode', true);
      Session.set('editorMode', false);
      break;
    case FEED_VOTE_LIVE_PEER:
      break;
    case FEED_VOTE_FINISH_APPROVED:
      break;
  }

}


/***
* main settings for navbar behaviour
* @param {string} title - title for it
****/
let _configNavbar = (title) => {
  if (Session.get('sidebar') == undefined) {
    Session.set('sidebar', true);
    Modules.client.toggleSidebar();
  };
  Session.set('navbar', {
    title: title,
    toggle: Session.get('sidebar'),
    href: '#',
    action: 'SIDEBAR'
  });
}


/***
* based on the query returns proper feed to fetch
* @param {object} query - query settings
* @return {string} feed - feed name constant
* TODO: this whole switch can easily be done programatically, i don't have time now.
****/
let _getQueryFeed = (query) => {
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
          switch(query.execution.toUpperCase()) {
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
          switch(query.execution.toUpperCase()) {
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
          switch(query.execution.toUpperCase()) {
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

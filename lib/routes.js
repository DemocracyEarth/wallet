Router.configure({
  layoutTemplate: 'main',
  loadingTemplate: 'load'
});

//Home page
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
      Session.set('sidebarMenuSelectedId', 1)
      setMainSessionVars();
      setNavigationBar(Meteor.settings.public.Collective.name);
      Session.set('feed', Contracts.find({ collectiveId: Session.get('collectiveId'), stage: { $ne: 'DRAFT' } }, {sort: {timestamp: -1} } ).fetch());
    };
    //Config Menu
    Modules.client.setSidebarMenu('all');
    this.next();
  }
});

Router.route('/:feed', {
  name: 'homeFeed',
  template: 'home',
  waitOn: function () {

  //  Meteor.subscribe('contracts', { collectiveId: Meteor.settings.public.Collective._id, kind: this.params.query.kind.toUpperCase() });
    if (this.params.query.kind) {
      var query = 'kind';
      Meteor.subscribe('contracts', { collectiveId: Meteor.settings.public.Collective._id, kind: this.params.query.kind.toUpperCase() });
    }
    if (this.params.query.stage) {
      var query = 'stage';
      Meteor.subscribe('contracts', { collectiveId: Meteor.settings.public.Collective._id, stage: this.params.query.stage.toUpperCase() });
    }

  },
  onBeforeAction: function () {
    setMainSessionVars(this.params.query);
    //Config menu
    this.next();
  },
  data: function () {
    switch(this.params.filter) {
      case 'kind':
      default:
    }
  }
});

//Login
Router.route('/login', {
  name: 'login'
});



// Application specific


// Votable Contracts.
Router.route('/vote/:contract', {

  name: 'voteContract',
  template: 'vote',

  waitOn: function () {
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
          Session.set('contractId', this.params.query.id);
          Session.set('contract', contract);
          Session.set('stage', 'draft');
          setNavigationBar(TAPi18n.__('navbar-editor'));
          break;

        }
      default:
        //Load contract with keyword
        var contract = Contracts.findOne({ keyword: this.params.contract });
        Session.set('contractId', contract._id);
        Session.set('contract', contract);
        Session.set("voteKeyword", this.params.contract);
        Session.set('stage', contract.stage);
        setNavigationBar(TAPi18n.__('navbar-proposal'));
    }
    Modules.client.setSidebarMenu('');
    setMainSessionVars();
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


// Delegation Contracts.
Router.route('/delegation/:contract', {

  name: 'delegationContract',
  template: 'delegation',

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
    setNavigationBar(TAPi18n.__('navbar-proposal'));
    Modules.client.setSidebarMenu('');
    setMainSessionVars();
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

// Semantic proxy keywords for delegation and contract description.
Router.route('/tag', {
  name: 'tag',
  template: 'organization'
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



function setMainSessionVars (query) {

  //Collective
  if (Session.get('collective') == undefined) {
    //Collective Info
    Session.set('collectiveId', Meteor.settings.public.Collective._id);
    Session.set('collective', Collectives.findOne({ _id: Session.get('collectiveId')}));
  }
  //Location
  if (query != undefined) {
    //Feed
    if (query.kind) {
      Session.set('voterMode', true);
      Session.set('feed', Contracts.find({ kind: query.kind.toUpperCase() }, {sort: {timestamp: -1}} ).fetch());
      Modules.client.setSidebarMenu(query.kind);
    } else if (query.stage) {
      Session.set('editorMode', true);
      Session.set('feed', Contracts.find({ stage: query.stage.toUpperCase() }, {sort: {timestamp: -1}} ).fetch());
      Modules.client.setSidebarMenu(query.stage);
    }
  }

}

function setNavigationBar (title) {
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

Router.configure({
  layoutTemplate: 'main',
  loadingTempalte: 'loading'
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
      setMainSessionVars();
      Session.set('feed', Contracts.find({ collectiveId: Session.get('collectiveId'), stage: { $ne: 'DRAFT' } }, {sort: {timestamp: -1} } ).fetch());
    };
    //Config Menu
    Session.set('inboxMenu', Modules.client.setMenu('all'));
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
Router.route('/vote', {
  name: 'vote',
  template: 'vote'
});


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
          var currentDate = new Date();
          Contracts.update(this.params.query.id, { $set: { timestamp: currentDate } });
          Session.set('contractId', this.params.query.id);
          Session.set('contract', Contracts.findOne({ _id: this.params.query.id }));
          Session.set('stage', 'draft');
          break;

        } else {

          //Create new contract
          if (!Contracts.findOne({keyword: 'draft-' + Meteor.userId()})) {
            console.log('user had no draft contract, new one created');
            Contracts.insert({ keyword: 'draft-' + Meteor.userId() });
          }
          var id =  Contracts.findOne({keyword: 'draft-' + Meteor.userId()})._id;
          Router.go('/vote/draft?id=' + id);

        }
      default:
        Session.set("voteKeyword", this.params.contract);
    }

    Session.set('navbar', {
      title: TAPi18n.__('navbar-editor'),
      icon: 'images/back.png',
      href: '/'
    });


    this.next();
  },
  data: function () {
    switch (this.params.contract) {
    case 'draft':
      break;
    default:
      var currentContract = Contracts.findOne({ keyword: this.params.contract });
      if (!currentContract) {
        //this.render('notFound'); //404 //TODO 404 page.
      } else {
        return currentContract;
      }
    }
  },
  onData: function () {

  },
  onAfterAction: function () {
    jQuery.getScript('/datepicker.js');
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
      Session.set('inboxMenu', Modules.client.setMenu(query.kind));
    } else if (query.stage) {
      Session.set('editorMode', true);
      Session.set('feed', Contracts.find({ stage: query.stage.toUpperCase() }, {sort: {timestamp: -1}} ).fetch());
      Session.set('inboxMenu', Modules.client.setMenu(query.stage));
    }

  } else {
    //Home
    Session.set('navbar', {
      title: TAPi18n.__('navbar-home'),
      icon: 'images/earth-button.png',
      href: '/'
    });
  }

}

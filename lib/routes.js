Router.configure({
  layoutTemplate: 'main',
  loadingTempalte: 'loading'
});

//Home page
Router.route('/', {
  name: 'home',
  template: 'home'
});

//Login
Router.route('/login');


//////////////////////
//Application specific
//////////////////////

// Votable Contracts.
Router.route('/vote', {
  name: 'vote',
  template: 'vote'
});


Router.route('/vote/:contract', {
  template: 'vote',
  waitOn: function () {
    console.log('[route] waitOn ' + this.params.contract);
    switch(this.params.contract) {
      case 'draft':
        return Meteor.subscribe('contracts', { _id: this.params.query.id });
        break;
      default:
        return Meteor.subscribe('contracts', { keyword: this.params.contract });
    }

  },
  onBeforeAction: function() {
    console.log('[route] onBeforeAction : ' + this.params.contract);
    switch (this.params.contract) {
      case 'draft':
        Session.set("contractId", this.params.query.id);
        break;
      default:
        Session.set("voteKeyword", this.params.contract);
    }
    this.next();
  },
  data: function () {
    console.log('[route] loading data for: ' + this.params.contract);
    switch (this.params.contract) {
    case 'draft':
      break;
    default:
      var currentContract = Contracts.findOne({ keyword: this.params.contract });
      if (!currentContract) {
        //this.render('notFound'); //404
      } else {
        return currentContract;
      }
    }
  },
  onData: function () {
    //ADD EVENT: When loaded  set  the date in the calendar.
  }
});


// Identities with right to vote and delegation.
Router.route('/peer', {
  name: 'peer',
  template: 'peer'
});

Router.route('/peer/:passport', {
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

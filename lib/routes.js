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
    return Meteor.subscribe('contracts', { keyword: this.params.contract });
  },
  onBeforeAction: function() {
    console.log('[route] onBeforeAction : ' + this.params.contract)
    Session.set("voteKeyword", this.params.contract);
    this.next();
  },
  data: function () {
    console.log('[route] loading data for: ' + this.params.contract);
    var currentContract = Contracts.findOne({ keyword: this.params.contract });
    if (!currentContract) {
      this.render('notFound'); //404
    } else {
      return currentContract;
    }
  }
});

// Identities with right to vote and delegation.
Router.route('/peer', {
  name: 'peer',
  template: 'peer'
});

// Semantic proxy keywords for delegation and contract description.
Router.route('/tag', {
  name: 'tag',
  template: 'tag'
});

// Collectives of peers.
Router.route('/hub', {
  name: 'hub',
  template: 'hub'
});

Router.configure({
  layoutTemplate: 'main'
});

//Home page
Router.route('/', {
  template: 'home'
});

//Login
Router.route('/login');


//////////////////////
//Application specific
//////////////////////

// Votable Contracts.
Router.route('/vote');

// Identities with right to vote and delegation.
Router.route('/peer');

// Semantic proxy keywords for delegation and contract description.
Router.route('/tag');

// Collectives of peers.
Router.route('/hub');

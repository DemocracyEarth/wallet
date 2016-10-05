Template.authentication.rendered = function () {
  Session.set('logger', false);
};

Template.authentication.helpers({
  toggle: function () {
    if (Session.get('logger')) {
      return 'navbar-button-active';
    } else {
      return '';
    }
  }
});

Template.authentication.events({
  'click #loggedUser': function (event) {
    Modules.client.displayLogin();
  }
})

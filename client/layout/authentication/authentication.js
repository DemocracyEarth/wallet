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
    Session.set('logger', !Session.get('logger'));
    if (Session.get('logger')) {
      Modules.client.displayPopup(event.target, Session.get('logger'), 'login', this, event.type);
    } else {
      Modules.client.animatePopup(false);
    }
  }
})

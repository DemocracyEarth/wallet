Template.authentication.helpers({
  toggle: function () {
    if (Session.get('displayPopup')) {
      return 'navbar-button-active';
    } else {
      return '';
    }
  }
});

Template.authentication.events({
  'click #loggedUser': function (event) {
    Modules.client.displayPopup(event.target, true, 'login');
  }
})

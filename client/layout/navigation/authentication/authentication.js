Template.authentication.rendered = function () {
  Session.set('displayLogin', false);
};

Template.authentication.helpers({
  displayLogin: function () {
    return Session.get('displayLogin');
  },
  toggle: function () {
    if (Session.get('displayLogin')) {
      return 'navbar-button-active';
    } else {
      return '';
    }
  }
});

Template.authentication.events({
    "click #current-user": function (event) {
      if (Session.get('displayLogin') == false) {
        Session.set('displayLogin', true);
      } else {
        Session.set('displayLogin', false);
      }
      displayPopup('login', document.getElementById('current-user'));
    }
});

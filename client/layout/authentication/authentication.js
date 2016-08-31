Template.authentication.helpers({
  toggle: function () {
    if (Session.get('displayPopup')) {
      return 'navbar-button-active';
    } else {
      return '';
    }
  }
});

Template.authentication.rendered = function () {
  Session.set('displayLogin', false);
};

Template.authentication.helpers({
  displayLogin: function () {
    console.log('cambia estatus ' + Session.get('displayLogin'))
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

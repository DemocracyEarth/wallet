Template.sidebar.rendered = function () {

}
Template.sidebar.helpers({
  menu: function () {
    return Session.get('inboxMenu');
  }
});

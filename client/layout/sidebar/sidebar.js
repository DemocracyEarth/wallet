Template.sidebar.rendered = function () {
  if (Session.get('sidebar') == true && $('#menu').css('margin-left') == "-320px") {
    console.log('PATCH');
    Session.set('sidebar', false);
  }
}
Template.sidebar.helpers({
  decisions: function () {
    return Session.get('menuDecisions');
  },
  personal: function () {
    return Session.get('menuPersonal');
  },
  delegates: function () {
    return Session.get('menuDelegates');
  }
});

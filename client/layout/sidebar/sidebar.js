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

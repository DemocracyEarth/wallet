Template.agora.helpers({
  emptyThread: function () {
    if (Session.get('contract').events.length > 0) {
      return false;
    } else {
      return true;
    }
  },
  event: function () {
    return Session.get('contract').events;
  }
});

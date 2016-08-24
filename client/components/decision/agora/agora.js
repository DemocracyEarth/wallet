Template.agora.helpers({
  emptyThread: function () {
    if (Session.get('contract').events.length > 0) {
      return false;
    } else {
      return true;
    }
  },
  event: function () {
    console.log(Session.get('contract').events);
  }
});

Template.agora.helpers({
  emptyThread: function () {
    if (Session.get('contract')) {
      if (Session.get('contract').events != undefined) {
        if (Session.get('contract').events.length > 0) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
  },
  event: function () {
    if (Session.get('contract')) {
      return Session.get('contract').events;
    }
  }
});

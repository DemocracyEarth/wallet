Template.conditions.helpers({
  transferable: function () {
    return Session.get('contract').transferable;
  },
  portable: function () {
    return Session.get('contract').portable;
  },
  limited: function () {
    return Session.get('contract').limited;
  }
})

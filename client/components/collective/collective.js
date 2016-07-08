Template.collective.helpers({
  title: function () {
    return Session.get('collective').name;
  },
  description: function () {
    return Session.get('collective').profile.bio;
  }
})

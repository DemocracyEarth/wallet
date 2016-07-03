Template.feed.helpers({
  item: function () {
    if (Session.get('feed').length == 0) {
      Session.set('emptyFeed', true);
    } else {
      Session.set('emptyFeed', false);
    }
    return Session.get('feed');
  },
  emptyFeed: function () {
    return Session.get('emptyFeed');
  }
})

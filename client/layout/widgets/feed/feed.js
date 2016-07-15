Template.feed.rendered = function () {
  Session.set('editorMode', false);
  Session.set('voterMode', false);
};

Template.feed.helpers({
  item: function () {
    if (Session.get('feed').length == 0) {
      Session.set('emptyFeed', true);
    } else {
      Session.set('emptyFeed', false);
    }
    console.log(Session.get('feed'));
    return Session.get('feed');
  },
  emptyFeed: function () {
    return Session.get('emptyFeed');
  },
  emptyContent: function () {
    return Session.get('emptyContent');
  },
  editorMode: function () {
    return Session.get('feedEditorMode');
  },
  voterMode: function () {
    return Session.get('feedVoterMode');
  }
})

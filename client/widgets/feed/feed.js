Template.feed.rendered = function () {
  Session.set('editorMode', false);
  Session.set('voterMode', false);

  if ($('.right').scrollTop() > 0) {
    $('.right').animate({ scrollTop: 0 });
  }

};

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

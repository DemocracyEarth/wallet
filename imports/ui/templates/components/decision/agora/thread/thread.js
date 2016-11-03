var replyBoxes = new Array();

Template.thread.helpers({
  timestamp: function () {
    return Modules.client.timeSince(this.timestamp);
  },
  noChildren: function () {
    if (this.children == undefined || this.children.length <= 0) {
      return 'no-children';
    } else {
      return '';
    }
  },
  reply: function () {
    var replyStringId = 'replybox' + this.id;
    if (!Session.get(replyStringId)) {
      return false;
    } else {
      return true;
    }
  },
  content: function () {
    return Modules.client.textFormat(this.content);
  },
  settingRanking: function () {
    if (Meteor.settings.public.app.config.commentRanking == false) {
      return false;
    } else {
      return true;
    }
  }
});

Template.thread.events({
  "click #replyToThread": function(event) {
    var replyStringId = 'replybox' + this.id;
    if (replyBoxes.length > 0) {
      for (var i = 0; i <= replyBoxes.length; i++) {
        if (replyBoxes[i] != replyStringId) {
          Session.set(replyBoxes[i], false);
          var index = replyBoxes.indexOf(replyBoxes[i]);
          if (index > -1) { replyBoxes.splice(index, 1); };

        }
      }
    }
    replyBoxes.push(replyStringId);
    Session.set(replyStringId, true);
  }
})

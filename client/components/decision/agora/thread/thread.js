var replyBoxes = new Array();

Template.thread.helpers({
  timestamp: function () {
    return Modules.client.timeSince(this.timestamp);
  },
  noChildren: function () {
    if (this.childred == undefined) {
      return 'no-children';
    } else {
      return '';
    }
  },
  reply: function () {
    var replyStringId = 'reply' + this.id;
    if (!Session.get(replyStringId)) {
      return false;
    } else {
      return true;
    }
  }
});

Template.thread.events({
  "click #replyToThread": function(event) {
    var replyStringId = 'reply' + this.id;

    console.log(replyBoxes);


    for (var i = 0; i <= replyBoxes.length; i++) {
      if (replyBoxes[i] != replyStringId) {
        Session.set(replyBoxes[i], false);
        console.log('unset' + replyBoxes[i]);
      }
    }

    Session.set(replyStringId, !Session.get(replyStringId));
  }
})

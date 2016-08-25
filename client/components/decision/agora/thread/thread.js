Template.thread.helpers({
  timestamp: function () {
    return Modules.client.timeSince(this.timestamp);
  },
  noChildren: function () {
    console.log(this);
  }
});

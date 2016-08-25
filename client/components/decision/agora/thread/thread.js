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
  }
});

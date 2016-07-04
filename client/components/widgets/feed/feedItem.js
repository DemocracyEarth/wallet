Template.feedItem.helpers({
  description: function () {
    return Modules.client.stripHTMLfromText(this.description).replace(/(([^\s]+\s\s*){35})(.*)/,"$1…");
  },
  tags: function () {
    return this.tags;
  },
  sinceDate: function (timestamp) {
    return TAPi18n.__('posted') + ' ' + Modules.client.timeSince(timestamp);
  },
  editorMode: function (mode) {
    if (mode == 'DRAFT') { return true } else { return false };
  },
  voterMode: function () {
    //if (mode == 'voter') { return true } else { return false };
  }

})

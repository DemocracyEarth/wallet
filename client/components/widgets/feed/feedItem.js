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
});

Template.feedItem.events({
  'click .micro-button-remove': function (event) {
    var proposalTitle = event.target.parentNode.getAttribute('title');
    var proposalId = event.target.parentNode.getAttribute('id');
    Modules.client.displayModal(
      true,
      {
        icon            : 'images/remove-item.png',
        title           : TAPi18n.__('remove-title'),
        message         : TAPi18n.__('remove-draft-warning') + " <br><em>" + proposalTitle + "</em>",
        cancel          : TAPi18n.__('not-now'),
        action          : TAPi18n.__('remove-draft'),
        isAuthorization : false
      },
      function() {
        Modules.both.removeContract(proposalId);
        Modules.client.displayNotice(TAPi18n.__('remove-draft-success'), true);
      }
    );
  }
})

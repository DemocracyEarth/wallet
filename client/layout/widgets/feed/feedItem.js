Template.feedItem.rendered = function () {
  console.log(this.firstNode.parentNode.id);

  //Embedded mode means that Items are in an embedded feed to be selected (ie: for a ballot)
  if (this.firstNode.parentNode.id == 'proposalSuggestions') {
    Session.set('embeddedMode', true);
  } else {
    Session.set('embeddedMode', false);
  }

};

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
  },
  embeddedMode: function () {
    return Session.get('embeddedMode');
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
  },
  'click .micro-button-addballot': function (event) {
    Meteor.call("addCustomForkToContract", Session.get('contractId'), event.target.parentNode.getAttribute('id'), function (error) {
        if (error && error.error == 'duplicate-fork') {
          Session.set('duplicateFork', true)
        } else {
          Session.set('dbContractBallot', Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false}).ballot );
        }
    });
  }
})

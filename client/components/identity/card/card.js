var newDelegateName = new String();

Template.card.helpers({
  myself: function () {
    return (this.toString() == Meteor.userId());
  },
  delegationKeyword: function () {
    Modules.both.getUserInfo(this.toString(), 'newDelegate');
    newDelegateName = slugName(Session.get('newDelegate').profile);
    return Session.get('newDelegate');
  }
})

Template.card.events({
  'click #delegate': function () {
    var keywordTitle = slugName(Meteor.user().profile) + '-' + newDelegateName;
    if (keywordTitle != undefined) {
      Modules.both.startDelegation(Meteor.userId(), this.toString(), keywordTitle);
      Modules.client.animatePopup(false);
    }
  }
})

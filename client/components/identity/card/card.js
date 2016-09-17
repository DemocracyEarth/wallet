var newDelegateName = new String();

Template.card.helpers({
  myself: function () {
    return (this.toString() == Meteor.userId());
  },
  delegationKeyword: function () {
    Modules.both.getUserInfo(this.toString(), 'newDelegate');
    newDelegateName = convertToSlug(Session.get('newDelegate').username);
    return Session.get('newDelegate');
  }
})

Template.card.events({
  'click #delegate': function () {
    var keywordTitle = convertToSlug(Meteor.user().username) + '-' + newDelegateName;
    if (keywordTitle != undefined) {
      Modules.both.startDelegation(Meteor.userId(), this.toString(), keywordTitle);
      Modules.client.animatePopup(false);
    }
  }
})

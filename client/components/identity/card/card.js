var newDelegateName = new String();

Template.card.helpers({
  myself: function () {
    return (this.toString() == Meteor.userId());
  },
  delegationKeyword: function () {
    Modules.both.getUserInfo(this.toString(), 'newDelegate');
    if (Session.get('newDelegate') != undefined) {
      newDelegateName = convertToSlug(Session.get('newDelegate').username);
      return Session.get('newDelegate');
    }
  }
})

Template.card.events({
  'click #delegate': function () {
    var keywordTitle = convertToSlug(Meteor.user().username) + '-' + convertToSlug(Session.get('newDelegate').username);
    if (keywordTitle != undefined) {
      console.log('Template.card.events:');
      console.log(this.toString());

      Modules.both.startDelegation(Meteor.userId(), this.toString(), {
        title: keywordTitle,
        signatures: [
          {
            username: Meteor.user().username
          },
          {
            username: Session.get('newDelegate').username
          }
        ]
      });
      Modules.client.animatePopup(false);
    }
  }
})

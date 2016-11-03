var newDelegateName = new String();

Template.card.helpers({
  myself: function () {
    return (this.toString() == Meteor.userId() || this._id == ANONYMOUS);
  },
  delegationKeyword: function () {
    var user = Meteor.users.findOne({ _id: this.toString() });
    Session.set('newDelegate', user);
    if (user != undefined) {
      newDelegateName = convertToSlug(user.username);
      return user;
    }
  }
})

Template.card.events({
  'click #delegate': function () {
    var keywordTitle = convertToSlug(Meteor.user().username) + '-' + convertToSlug(Session.get('newDelegate').username);
    if (keywordTitle != undefined) {
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

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
    var keywordTitle = newDelegateName + '-' + slugName(Meteor.user().profile);
    if (keywordTitle != undefined) {
      console.log('this.toString():');
      console.log(this.toString());
      Modules.both.startDelegation(Meteor.userId(), this.toString(), keywordTitle);
    }
  }
})

Template.card.helpers({
  myself: function () {
    return (this.toString() == Meteor.userId());
  }
})

Template.card.events({
  'click #delegate': function () {
    Modules.both.startDelegation(Meteor.userId(), this.toString());
  }
})

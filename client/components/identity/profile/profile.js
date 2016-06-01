Template.profile.helpers({
  configProfile: function () {
    return !Meteor.user().profile.configured;
  },
  tags: function () {
    if (Meteor.user().profile.votes.total > 0) {
      console.log('has votes');
    } else {
      console.log('no votes');
    }
  },
  userId: function () {
    return Meteor.user()._id;
  }
})

Template.profile.events({
  'click #logout': function(event){
      event.preventDefault();
      Meteor.logout();
  }
});

Template.profile.helpers({
  configProfile: function () {
    return !Meteor.user().profile.configured;
  }
})

Template.profile.events({
  'click #logout': function(event){
      event.preventDefault();
      Meteor.logout();
  }
});

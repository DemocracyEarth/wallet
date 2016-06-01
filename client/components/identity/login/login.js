Template.login.events({
  'click #logout': function(event){
      Meteor.logout();
  }
});

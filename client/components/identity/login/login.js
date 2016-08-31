Template.login.events({
  'click #logout': function(event){
    Session.set('displayPopup', false);
    Meteor.logout();
  }
});

Template.login.events({
  'click #logout': function(event){
    Session.set('displayLogin', false);
    Meteor.logout();    
  }
});

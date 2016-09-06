Template.login.rendered = function () {
};

Template.login.events({
  'click #logout': function(event){
    Session.set('displayPopup', false);
    Session.set('logger', false);
    Modules.client.animatePopup(false);
    Meteor.logout();
  }
});

Template.login.rendered = function () {
  console.log('login template to earth');
};

Template.login.events({
  'click #logout': function(event){
    Session.set('displayPopup', false);
    Meteor.logout();
  }
});

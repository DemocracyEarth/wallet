Template.profile.rendered = function () {

}

Template.profile.helpers({
  configProfile: function () {
    return !Meteor.user().profile.configured;
  },
  firstName: function() {
    return Meteor.user().profile.firstName;
  },
  lastName: function () {
    return Meteor.user().profile.lastName;
  },
  country: function () {
    return Meteor.user().profile.country.name;
  },
  showNations: function () {
    return Session.get('showNations');
  }
})

Template.profile.events({
  'click #logout': function(event){
      event.preventDefault();
      Meteor.logout();
  },
  'focus #nation': function () {
    Session.set('showNations', true);
  },
  'blur #nation': function () {
    Session.set('showNations', false);
  }
});

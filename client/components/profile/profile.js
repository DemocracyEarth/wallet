Template.profile.rendered = function () {
  geoJSON = new Object;

  HTTP.get(Meteor.absoluteUrl("data/geo.json"), function(err,result) {
    geoJSON = result.data;
    Session.set('filteredCountries', result.data.country);
  });
}

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

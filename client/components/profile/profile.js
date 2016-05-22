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
  'focus .country-search': function () {
    Session.set('showNations', true);
  },
  'blur .country-search': function () {
    Session.set('showNations', false);
  },
  'input .country-search': function (event) {
    if (event.target.value != '') {
      Session.set('filteredCountries', searchJSON(geoJSON.country, event.target.value));
    } else {
      Session.set('filteredCountries', geoJSON.country);
    }
  }
});

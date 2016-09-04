Template.profileEditor.rendered = function () {
  Session.set('showNations', false);
}

Template.profileEditor.helpers({
  firstName: function() {
    return Meteor.user().profile.firstName;
  },
  lastName: function () {
    return Meteor.user().profile.lastName;
  },
  country: function () {
    if (Session.get('newCountry') != undefined) {
      return Session.get('newCountry').name;
    } else {
      if (Meteor.user().profile.country != undefined) {
        return Meteor.user().profile.country.name;
      }
    }
  },
  showNations: function () {
    return Session.get('showNations');
  },
  noNameFound: function () {
    return Session.get('noNameFound');
  }
})

Template.profileEditor.events({
  'focus .country-search': function () {
    Session.set('showNations', true);
  },
  'focus .login-input-split-right': function () {
    Session.set('showNations', false);
  },
  'input .country-search': function (event) {
    if (event.target.value != '') {
      Session.set('filteredCountries', Modules.client.searchJSON(geoJSON.country, event.target.value));
    } else {
      Session.set('filteredCountries', geoJSON.country);
    }
  },
  'click #skip-step': function () {
    var data = Meteor.user().profile;
    Session.set('newCountry', undefined);
    data.configured = true;
    Meteor.users.update(Meteor.userId(), { $set: { profile : data }});
  },
  'click #save-profile': function () {

    if (document.getElementById('editFirstName').value == '') {
      Session.set('noNameFound', true);
    } else {
      Session.set('noNameFound', false);

      //Save
      var data = Meteor.user().profile;
      data.firstName = document.getElementById('editFirstName').value;
      data.lastName = document.getElementById('editLastName').value;

      if (Session.get('newCountry') != undefined) {
        data.country = Session.get('newCountry');
      }

      data.configured = true;
      Meteor.users.update(Meteor.userId(), { $set: { profile : data }})
    }
  }
})

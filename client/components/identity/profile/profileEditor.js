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
    if (Meteor.user().profile.country != undefined) {
      return Meteor.user().profile.country.name;
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
      Session.set('filteredCountries', searchJSON(geoJSON.country, event.target.value));
    } else {
      Session.set('filteredCountries', geoJSON.country);
    }
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
      data.configured = true;
      Meteor.users.update(Meteor.userId(), { $set: { profile : data }})
    }
  }
})

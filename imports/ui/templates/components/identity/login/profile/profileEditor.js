import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { validateUsername } from '/imports/startup/both/modules/User';
import { searchJSON } from '/imports/ui/modules/JSON';

Template.profileEditor.onRendered = function onRender() {
  Session.set('showNations', false);
  Session.set('noNameFound', false);
  Session.set('noUsernameFound', false);
}

Template.profileEditor.helpers({
  firstName: function() {
    return Meteor.user().profile.firstName;
  },
  lastName: function () {
    return Meteor.user().profile.lastName;
  },
  userName: function () {
    return Meteor.user().username;
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
  },
  noUsernameFound: function () {
    return Session.get('noUsernameFound');
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
  'click #skip-step': function () {
    var data = Meteor.user().profile;
    Session.set('newCountry', undefined);
    data.configured = true;
    Meteor.users.update(Meteor.userId(), { $set: { profile : data }});
  },
  'click #save-profile': function () {

    if (document.getElementById('editFirstName').value == '') {
      Session.set('noNameFound', true);
    } else if (!validateUsername(document.getElementById('editUserName').value)) {
      Session.set('noUsernameFound', true);
    } else {
      Session.set('noNameFound', false);
      Session.set('noUsernameFound', false);

      //Save
      var data = Meteor.user().profile;
      var editUsername = document.getElementById('editUserName').value;
      data.firstName = document.getElementById('editFirstName').value;
      data.lastName = document.getElementById('editLastName').value;


      if (Session.get('newCountry') != undefined) {
        data.country = Session.get('newCountry');
      }

      data.configured = true;
      Meteor.users.update(Meteor.userId(), { $set: { profile : data }});
      Meteor.users.update(Meteor.userId(), { $set: { username : editUsername }});
    }
  }
});

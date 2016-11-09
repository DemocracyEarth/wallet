import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';

import { validateUsername } from '/imports/startup/both/modules/User';
import { searchJSON } from '/imports/ui/modules/JSON';
import { globalObj } from '/lib/global';

import './profileEditor.html';
import '../../avatar/avatar.js';
import '../../../../widgets/warning/warning.js';
import '../../../../widgets/suggest/suggest.js';

Template.profileEditor.onRendered = function onRender() {
  Session.set('showNations', false);
  Session.set('noNameFound', false);
  Session.set('noUsernameFound', false);
}

Template.profileEditor.helpers({
  firstName() {
    return Meteor.user().profile.firstName;
  },
  lastName() {
    return Meteor.user().profile.lastName;
  },
  userName() {
    return Meteor.user().username;
  },
  country() {
    if (Session.get('newCountry') !== undefined) {
      return Session.get('newCountry').name;
    }
    if (Meteor.user().profile.country !== undefined) {
      return Meteor.user().profile.country.name;
    }
    return undefined;
  },
  showNations() {
    return Session.get('showNations');
  },
  noNameFound() {
    return Session.get('noNameFound');
  },
  noUsernameFound() {
    return Session.get('noUsernameFound');
  }
})

Template.profileEditor.events({
  'focus .country-search'() {
    Session.set('showNations', true);
  },
  'focus .login-input-split-right'() {
    Session.set('showNations', false);
  },
  'input .country-search'(event) {
    if (event.target.value !== '') {
      Session.set('filteredCountries', searchJSON(globalObj.geoJSON.country, event.target.value));
    } else {
      Session.set('filteredCountries', globalObj.geoJSON.country);
    }
  },
  'click #skip-step'() {
    const data = Meteor.user().profile;
    Session.set('newCountry', undefined);
    data.configured = true;
    Meteor.users.update(Meteor.userId(), { $set: { profile: data } });
  },
  'click #save-profile'() {
    if (document.getElementById('editFirstName').value === '') {
      Session.set('noNameFound', true);
    } else if (!validateUsername(document.getElementById('editUserName').value)) {
      Session.set('noUsernameFound', true);
    } else {
      Session.set('noNameFound', false);
      Session.set('noUsernameFound', false);

      // Save
      let data = Meteor.user().profile;
      let editUsername = document.getElementById('editUserName').value;
      data.firstName = document.getElementById('editFirstName').value;
      data.lastName = document.getElementById('editLastName').value;

      if (Session.get('newCountry') != undefined) {
        data.country = Session.get('newCountry');
      }
      data.configured = true;
      Meteor.users.update(Meteor.userId(), { $set: { profile: data } });
      Meteor.users.update(Meteor.userId(), { $set: { username: editUsername } });
    }
  },
});

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import { validateUsername } from '/imports/startup/both/modules/User';
import { searchJSON } from '/imports/ui/modules/JSON';
import { geo } from '/lib/geo';
import { templetize, getImage } from '/imports/ui/templates/layout/templater';
import { validateEmail } from '/imports/startup/both/modules/validations.js';
// import { emailListCheck } from '/lib/permissioned';


import '/imports/ui/templates/components/identity/login/profile/profileEditor.html';
import '/imports/ui/templates/components/identity/avatar/avatar.js';
import '/imports/ui/templates/widgets/warning/warning.js';
import '/imports/ui/templates/widgets/suggest/suggest.js';


Template.profileEditor.onCreated(function () {
  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.profileEditor.rendered = function rendered() {
  Session.set('showNations', false);
  Session.set('noUsernameFound', false);
  Session.set('invalidEmail', false);
};

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
  email() {
    if (Meteor.user().emails && Meteor.user().emails[0].address) {
      return Meteor.user().emails[0].address;
    }
    return undefined;
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
  noUsernameFound() {
    return Session.get('noUsernameFound');
  },
  usernameAlreadyExists() {
    return (Session.get('queryUsernameStatus') === 'DUPLICATE');
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
  invalidEmail() {
    return Session.get('invalidEmail');
  },
  profileEmailSet() {
    if (Meteor.user().emails) {
      if (Meteor.user().emails[0].address && Meteor.user().emails[0].address !== '') {
        return true;
      }
    }
    return false;
  },
  verifiedMail() {
    if (Meteor.settings.public.app.config.mailNotifications) {
      if (Meteor.user().emails) {
        return Meteor.user().emails[0].verified;
      }
    }
    return true;
  },
  verifiedMailClass() {
    if (Meteor.user().emails && !Meteor.user().emails[0].verified) {
      return 'login login-editor';
    }
    return 'login';
  },
});

Template.profileEditor.events({
  'focus .country-search'() {
    Session.set('showNations', true);
  },
  'focus .login-input-split-right'() {
    Session.set('showNations', false);
  },
  'input .country-search'(event) {
    if (event.target.value !== '') {
      Session.set('filteredCountries', searchJSON(geo.country, event.target.value));
    } else {
      Session.set('filteredCountries', geo.country);
    }
  },
  'blur #editUserName'() {
    const validation = validateUsername(document.getElementById('editUserName').value);
    if (validation.valid) {
      Session.set('noUsernameFound', false);
      Session.set('queryUsernameStatus', '');
    } else {
      Session.set('noUsernameFound', true);
    }
  },
  'click #skip-step'() {
    const data = Meteor.user().profile;
    Session.set('newCountry', undefined);
    data.configured = true;
    Meteor.users.update(Meteor.userId(), { $set: { profile: data } });
    Session.set('cardNavigation', false);
  },
  'click #save-profile'() {
    const editUsername = document.getElementById('editUserName').value;
    const editEmail = document.getElementById('editEmail').value;
    const validation = validateUsername(editUsername);
    let currentEmail;
    if (Meteor.user().emails) {
      currentEmail = Meteor.user().emails[0].address;
    } else {
      currentEmail = undefined;
    }

    if (!validateEmail(editEmail) && editEmail !== '') {
      Session.set('invalidEmail', true);
    } else if (!validation.valid || editUsername === '') {
      Session.set('noUsernameFound', true);
      Session.set('queryUsernameStatus', '');
    } else if (Session.get('queryUsernameStatus') === 'SINGULAR') {
      Session.set('noUsernameFound', false);

      // Save
      const data = Meteor.user().profile;
      // data.firstName = document.getElementById('editFirstName').value;
      // data.lastName = document.getElementById('editLastName').value;

      if (Session.get('newCountry') !== undefined) {
        data.country = Session.get('newCountry');
      }
      data.configured = true;
      Meteor.users.update(Meteor.userId(), { $set: { profile: data } });
      Meteor.users.update(Meteor.userId(), { $set: { username: editUsername } });

      if ((editEmail !== currentEmail && editEmail !== '')) {
        const email = [
          {
            address: editEmail,
            verified: false,
          },
        ];
        Meteor.users.update(Meteor.userId(), { $set: { emails: email } });
        if (Meteor.settings.public.app.config.allowWebVotes) {
          // can add here extra condition: if (emailListCheck(editEmail))
          Meteor.call('subsidizeUser', Meteor.user()._id, (subsidyError) => {
            if (subsidyError) {
              console.log(subsidyError, 'error with subsidizeUser');
            }
          });
        }
        Meteor.call('sendVerificationLink', (verificationError) => {
          if (verificationError) {
            console.log(verificationError.reason, 'error with sendVerificationLink');
          }
        });
      }
    }
  },
});

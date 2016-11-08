import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';

import './profile.html';
import './profileEditor.js';

Template.profile.helpers({
  configProfile: function () {
    return !Meteor.user().profile.configured;
  },
  tags: function () {
    if (Meteor.user().profile.votes.total > 0) {

    } else {

    }
  },
  userId: function () {
    return Meteor.user()._id;
  },
  socialMediaLogin: function () {
    if (Meteor.user().profile.credentials != undefined) {
      for (var i = 0; i < Meteor.user().profile.credentials.length; i++) {
        if (Meteor.user().profile.credentials[i].validated) {
          return true;
        }
      }
    }
    return false;
  },
  hasDelegations: function () {
    //TODO implement delegation reader to display them.
    return false;
  }
});

Template.profile.events({
  'click .resend-verification-link'(event, instance) {
    console.log('[Template.warning.events] sending email...');
    Meteor.call( 'sendVerificationLink', ( error, response ) => {
      if ( error ) {
        console.log( error.reason, 'danger' );
      } else {
        let email = Meteor.user().emails[ 0 ].address;
        console.log( `[Template.warning.events] verification sent to ${ email }!`, 'success' );
      }
    });
  }
})

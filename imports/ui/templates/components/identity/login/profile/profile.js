import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { TAPi18n } from 'meteor/tap:i18n';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';

import { templetize, getImage } from '/imports/ui/templates/layout/templater';

import './profile.html';
import './profileEditor.js';
import '../../avatar/avatar.js';
import '../../authenticity/authenticity.js';
import '../../../../widgets/warning/warning.js';
import './multiTokenProfile.html';
import './multiTokenProfile.js';

Template.profile.onCreated(function () {
  Template.instance().imageTemplate = new ReactiveVar();
  templetize(Template.instance());
});

Template.profile.helpers({
  configProfile() {
    return !Meteor.user().profile.configured;
  },
  tags() {
  },
  userId() {
    return Meteor.user()._id;
  },
  socialMediaLogin() {
    if (Meteor.user().profile.credentials !== undefined) {
      for (let i = 0; i < Meteor.user().profile.credentials.length; i += 1) {
        if (Meteor.user().profile.credentials[i].validated) {
          return true;
        }
      }
    }
    return false;
  },
  verifiedMail() {
    if (Meteor.settings.public.app.config.mailNotifications && Meteor.user().emails) {
      return Meteor.user().emails[0].verified;
    }
    return true;
  },
  hasDelegations() {
    // TODO implement delegation reader to display them.
    return false;
  },
  totalVotes() {
    return `${TAPi18n.__('total-votes')} <strong style='color: white'>${Meteor.user().profile.wallet.balance.toLocaleString()}</strong> `;
  },
  isMultiTokenUser() {
    if (Meteor.user().profile.wallet.reserves != null) {
      return true;
    }
    return false;
  },
  getImage(pic) {
    return getImage(Template.instance().imageTemplate.get(), pic);
  },
});

Template.profile.events({
  'click .resend-verification-link'() {
    Meteor.call('sendVerificationLink', (error) => {
      if (error) {
        console.log(error.reason, 'danger');
      } else {
        const email = Meteor.user().emails[0].address;
        console.log(`[Template.warning.events] verification sent to ${email}!`, 'success');
      }
    });
  },
  'click #edit-profile'() {
    const data = Meteor.user().profile;
    data.configured = false;
    Meteor.users.update(Meteor.userId(), { $set: { profile: data } });
    Session.set('cardNavigation', true);
  },
});

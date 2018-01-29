import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import './collective.html';

Template.collective.onRendered(() => {
  
});

Template.collective.helpers({
  title() {
    return Meteor.settings.public.Collective.name;
  },
  description() {
    return Meteor.settings.public.Collective.profile.bio;
  },
  picture() {
    if (Meteor.settings.public.Collective.profile.logo) {
      return Meteor.settings.public.Collective.profile.logo;
    }
    return 'images/earth.png';
  },
  hasLogo() {
    return (Meteor.settings.public.Collective.profile.logo !== undefined);
  },
  members() {
    const count = Meteor.users.find().count();
    if (count === 1) {
      return `${Meteor.users.find().count()} ${TAPi18n.__('member')}`;
    }
    return `${Meteor.users.find().count()} ${TAPi18n.__('members')}`;
  },
});

Template.collective.events({
  'click #collective-home'() {
    Router.go('/');
  },
});

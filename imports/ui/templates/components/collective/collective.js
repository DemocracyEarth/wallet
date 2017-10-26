import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { Router } from 'meteor/iron:router';

import './collective.html';

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
});

Template.collective.events({
  'click #collective-home'() {
    Router.go('/');
  },
});

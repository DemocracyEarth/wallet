import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';
import { ReactiveVar } from 'meteor/reactive-var';

import { promptLogin } from '/imports/ui/templates/components/collective/collective.js';

import '/imports/ui/templates/layout/url/hero/hero.html';


Template.hero.helpers({
  title() {
    return TAPi18n.__('landing-title');
  },
  about() {
    return TAPi18n.__('landing-tagline');
  },
});

Template.navbar.onCreated(function () {
  Template.instance().activeSignIn = new ReactiveVar(false);
});

Template.navbar.helpers({
  picture() {
    if (Meteor.settings.public.Collective.profile.logo) {
      return Meteor.settings.public.Collective.profile.logo;
    }
    return 'images/earth.png';
  },
  mode() {
    if (Template.instance().activeSignIn.get()) {
      return 'hero-menu-link-signin-active';
    }
    return '';
  },
});

Template.navbar.events({
  'click #collective-login'() {
    event.stopPropagation();
    const buttonMode = !Template.instance().activeSignIn.get();
    Template.instance().activeSignIn.set(buttonMode);
    promptLogin(buttonMode, event);
  },
});

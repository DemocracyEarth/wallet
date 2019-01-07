import { Template } from 'meteor/templating';
import { Session } from 'meteor/session';
import { ReactiveVar } from 'meteor/reactive-var';
import { Router } from 'meteor/iron:router';
import { Meteor } from 'meteor/meteor';
import { TAPi18n } from 'meteor/tap:i18n';

import '/imports/ui/templates/layout/url/hero/hero.html';
import '/imports/ui/templates/components/collective/collective.js';

Template.hero.helpers({
  title() {
    return TAPi18n.__('landing-title');
  },
  about() {
    return TAPi18n.__('landing-tagline');
  },
  logo() {
    return `${Router.path('home')}images/democracy-earth-white.png`;
  },
});

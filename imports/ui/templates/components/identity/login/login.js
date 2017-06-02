import { Meteor } from 'meteor/meteor';
import { Router } from 'meteor/iron:router';
import { Template } from 'meteor/templating';

import { animatePopup } from '/imports/ui/modules/popup';
import './login.html';
import './profile/profile.js';
import './logger.js';

Template.login.events({
  'click #logout'() {
    // Session.set('displayPopup', false);
    animatePopup(false, `login-${Meteor.userId()}`);
    Meteor.logout();
    Router.go('/');
  },
});
